import { defineStore } from 'pinia';
import {
    URLS,
    ChainType, getStatus, ErrorType,
} from 'theta_database/src/edgeStore';
import { ContractInfoType } from 'theta_database/src/solc/compileSol';
import ShareableStorage from 'theta_database/src/contract';
import { ConnectionState } from '@/scripts/utils';
import { isConnected } from '@/scripts/db';
import axios from 'axios';
import compileContract from '../assets/compiledContract.json';

interface IConnections {
    edgeStore: number;
    market: number;
    thetanet: number;
}

const postURLOrNet = async (path: string, urlOrChain: string|ChainType) => {
    try {
        await axios.post(path, { data: urlOrChain });
    } catch {
        throw new Error('Unable to change URL');
    }
};

const useURLS = defineStore('urls', {
    state: () => ({
        edgeStore: import.meta.env.VITE_EDGESTORE_URL || URLS.edgeStoreURL,
        thetanet: {
            url: import.meta.env.VITE_THETANET_URL || URLS.thetanet.url,
            chainID: import.meta.env.VITE_THETANET_CHAINID || URLS.thetanet.chainID,
        } as ChainType,

        connectionState: {
            edgeStore: ConnectionState.NONE,
            market: ConnectionState.NONE,
            thetanet: ConnectionState.NONE,
        } as IConnections,
    }),

    getters: {
        checkState: (state) => {
            const fn = (conn: keyof IConnections, connState: keyof typeof ConnectionState) => {
                const left = state.connectionState[conn];
                const right = ConnectionState[connState];
                return left === right;
            };
            return fn;
        },
    },

    actions: {
        setEdgeStoreURL(url: string): void {
            this.edgeStore = url;
        },
        setThetanet(chain: ChainType): void {
            this.thetanet = chain;
        },
        setThetanetURL(url: string): void {
            this.thetanet.url = url;
        },
        setThetanetChainID(id: number): void {
            this.thetanet.chainID = id;
        },

        initShareableStorage(): void {
            ShareableStorage.init(URLS.thetanet, compileContract as unknown as ContractInfoType);
        },

        changeState(conn: keyof IConnections, state: keyof typeof ConnectionState): void {
            this.connectionState[conn] = ConnectionState[state];
        },

        async checkEdgeConnection(url: string): Promise<Error|undefined> {
            URLS.edgeStoreURL = url;
            this.changeState('edgeStore', 'CONNECTING');
            try {
                await postURLOrNet('/edgestore/update', url);
                const { data } = await getStatus(0);
                const res = data as Record<string, unknown>;
                const hasError = typeof res.error !== 'undefined';
                if (hasError) {
                    const { code, message } = (res as ErrorType).error;
                    throw new Error(`Attempt to connect failed with error code="${code}" and with message="${message}"`);
                }
                this.edgeStore = url;
                this.changeState('edgeStore', 'SUCCESS');
                return undefined;
            } catch (e) {
                this.changeState('edgeStore', 'FAILED');
                URLS.edgeStoreURL = this.edgeStore;
                return e as Error;
            }
        },

        async checkThetanetConnection(net: ChainType): Promise<Error|undefined> {
            URLS.thetanet = net;
            this.changeState('thetanet', 'CONNECTING');
            try {
                // await postURLOrNet('/thetanet/update', net);
                this.initShareableStorage();
                const web = ShareableStorage._web;
                if (!web) throw new Error('Oops, unable to initialize ShareableStorage');
                await web.eth.net.isListening();
                this.thetanet = net;
                this.changeState('thetanet', 'SUCCESS');
                return undefined;
            } catch (e) {
                const mess = (e as Error).message;
                if (mess.match('Returned error')) {
                    this.thetanet = net;
                    this.changeState('thetanet', 'SUCCESS');
                    return undefined;
                }
                this.changeState('thetanet', 'FAILED');
                URLS.thetanet = this.thetanet;
                return e as Error;
            }
        },

        async checkFirebaseConnection(): Promise<Error|undefined> {
            this.changeState('market', 'CONNECTING');
            try {
                await isConnected();
                this.changeState('market', 'SUCCESS');
            } catch (e) {
                this.changeState('market', 'FAILED');
                return e as Error;
            }
            return undefined;
        },
    },
});

export default useURLS;
