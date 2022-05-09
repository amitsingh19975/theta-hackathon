/* eslint-disable max-len */
/* eslint-disable class-methods-use-this */
const getIcon = (nodes: Element[]) => nodes
    .filter((el) => el instanceof HTMLLinkElement)
    .map((el) => el as HTMLLinkElement).pop();

const getWebsiteInfo = () => {
    let org = '';
    let icon: HTMLLinkElement|undefined;
    let title: string|null|undefined;

    const selectAll = (el: Document, pat: string) => el.querySelectorAll(pat);
    const select = (el: Document, pat: string) => el.querySelector(pat);

    if (window) {
        org = window.location && ('origin' in window.location) ? window.location.origin : '';

        if ('document' in window) {
            const doc = window.document;
            const shortcutIcon = select(doc, 'head > link[rel="shortcut icon"]') as (HTMLLinkElement | null);
            icon = shortcutIcon || getIcon(Array.from(selectAll(doc, 'head > link[rel="icon"]')));
        }
    }

    if (document) {
        const siteName = select(document, 'head > meta[property="og:site_name"]');
        title = siteName?.textContent || select(document, 'head > meta[name="title"]')?.textContent;
    }

    return {
        title: title || document.title,
        iconUrl: (icon && icon.href) || `${org}/favicon.ico`,
    };
};

const IFRAME_ID = '__THETA_WALLET_CONNECT__';
const IFRAME_URL = 'https://wallet.thetatoken.org/theta-wallet-connect.html';

type Requester = {
    origin: string;
    title: string;
    iconUrl: string;
}

interface TransactionTrait {
    toJson() : Record<string|symbol|number, unknown>;
}

interface ConfigTrait {
    get chainId() : number;
    get isUnlocked(): boolean;
}

type CallbackFnType = (errMsg: string|null, result: unknown) => void;
type ParamType = Record<string|symbol|number, unknown>[];

type RPCReqType = {
    jsonrpc: '2.0',
    method: string,
    params: ParamType,
    id: number|symbol|string,
    metadata?: {
        requester: Requester,
    }
}

type EventType = {
    data: {
        target: string,
        data: {
            id: string|number|symbol,
            error: Error,
            result: unknown,
            method: string,
            params: ParamType
        }
    }
}

class ThetaWalletConnect {
    private _isConnected = false;
    private _callbacks: Record<number|string|symbol, CallbackFnType>;
    private _bridgeIframe: HTMLIFrameElement | null = null;
    private _r = '';
    private _requester: Requester;
    private _publicConfig: ConfigTrait | null = null;
    private _initPromise?: Promise<boolean>;

    constructor() {
        this._requester = {
            origin: '',
            iconUrl: '',
            title: '',
        };

        this._callbacks = {};
    }

    connect() : Promise<boolean> {
        this._initPromise = new Promise<boolean>((resolve, reject) => {
            if (this._isConnected) {
                resolve(true);
                return;
            }

            this._requester = { ...getWebsiteInfo(), origin: window.location.origin };

            this._r = encodeURIComponent(btoa(JSON.stringify(this._requester)));

            let iframe = document.getElementById(IFRAME_ID) as (HTMLIFrameElement|null);
            if (!iframe) {
                iframe = document.createElement('iframe') as HTMLIFrameElement;
                iframe.id = IFRAME_ID;
                iframe.style.display = 'none';
                iframe.onload = () => {
                    this._isConnected = true;
                    this._bridgeIframe = iframe;

                    resolve(true);
                };

                iframe.onerror = () => {
                    reject(new Error('Failed to connect to Theta Wallet.'));
                };

                iframe.setAttribute('src', IFRAME_URL);
                document.body.appendChild(iframe);

                this._setUpMessageListener();
            } else {
                resolve(true);
            }
        });

        return this._initPromise;
    }

    disconnect() : Promise<boolean> {
        const promise = new Promise<boolean>((resolve) => {
            const iframe = document.getElementById(IFRAME_ID);
            if (iframe && iframe.parentNode) {
                iframe.parentNode.removeChild(iframe);

                this._isConnected = false;
                this._bridgeIframe = null;
                this._publicConfig = null;
            }
            this._removeMessageListener();

            resolve(true);
        });

        return promise;
    }

    isConnected() : boolean {
        return (this._isConnected && this._publicConfig !== null);
    }

    async requestAccounts() : Promise<string[]> {
        const res = await this._sendRPCRequestToContentScriptBridge('requestAccounts', []);
        return res as string[];
    }

    sendTransaction(transaction: TransactionTrait) : Promise<unknown> {
        if (!transaction) {
            throw new Error('transaction must be a thetajs Transaction.');
        }
        if (!transaction.toJson) {
            throw new Error('transaction must be a thetajs Transaction.');
        }

        const transactionRequest = transaction.toJson();
        return this._sendRPCRequestToContentScriptBridge('sendTransaction', [{ transactionRequest }]);
    }

    getChainId() : number {
        return this._publicConfig?.chainId || -1;
    }

    isUnlocked() : boolean {
        return this._publicConfig?.isUnlocked || false;
    }

    private _registerCallback(id: number|string|symbol, cb: CallbackFnType) : void {
        this._callbacks[id] = cb;
    }

    private _buildRPCRequest(method: string, params: ParamType) : RPCReqType {
        return {
            jsonrpc: '2.0',
            method,
            params,
            id: Date.now(),
        };
    }

    private _sendRPCRequestToContentScriptBridge(method: string, params: ParamType, callback?: CallbackFnType) : Promise<unknown> {
        return new Promise((resolve, reject) => {
            const cb = callback || ((error, result) => (error ? reject(new Error(error)) : resolve(result)));

            const request = this._buildRPCRequest(method, params);
            request.metadata = {
                requester: this._requester,
            };

            this._registerCallback(request.id, cb);
            if (this._bridgeIframe && this._bridgeIframe.contentWindow) {
                this._bridgeIframe.contentWindow.postMessage({
                    target: 'theta-wallet.contentscript-forwarder',
                    data: request,
                }, '*');
            }
        });
    }

    private _handleMessage = (event: Event & EventType) => {
        if (!event.data || (typeof event.data !== 'object')) {
            return;
        }

        if (!event.data.target) {
            return;
        }

        if (event.data.target === 'theta-wallet.connect') {
            const {
                id, error, result, method, params,
            } = event.data.data;

            if (method === 'updateThetaWalletPublicConfig') {
                const newConfig = params[0].publicConfig as ConfigTrait;

                if ((newConfig && this._publicConfig) && (newConfig.chainId !== this.getChainId())) {
                    this._publicConfig = newConfig;
                }

                return;
            }

            if (id !== undefined && (result || error)) {
                const cb = this._callbacks[id];

                if (cb) {
                    const errorMsg = (error ? error.message : null);

                    cb(errorMsg, result);
                }
            }
        }
    };

    private _setUpMessageListener() : void {
        window.addEventListener('message', this._handleMessage, false);
    }

    private _removeMessageListener() : void {
        window.removeEventListener('message', this._handleMessage, false);
    }
}

export default new ThetaWalletConnect();
