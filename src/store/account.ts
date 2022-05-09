import { defineStore } from 'pinia';
import {
    IStrictUser,
    IUser, IUserBio, loginUser, registerUserHelper, signOutUser, userAccountAddress,
} from '@/scripts/user';
import {
    ErrorCallbackType,
    notifyNeg,
    notifyPos,
    validateAddress,
    validateEmail,
    validateFirstName,
    validateLastName,
} from '@/scripts/utils';

import { getUser } from '@/scripts/db';
import ShareableStorage from 'theta_database/src/contract';
import { fromWei } from 'web3-utils';
import useFSStore from './fs';

// const getFS = (address: string) => {};

const checkUserInfo = (user?: Record<string, unknown>) => {
    if (!user) return false;
    if (typeof user.address === 'undefined') return false;
    if (typeof user.info === 'undefined') return false;

    const info = user.info as Record<string, unknown>;
    if (typeof info.firstname === 'undefined') return false;
    if (typeof info.lastname === 'undefined') return false;
    if (typeof info.avatar === 'undefined') return false;
    if (typeof info.email === 'undefined') return false;

    if (typeof user.filesystem === 'undefined') return false;

    return true;
};

const useAccountStore = defineStore('accountStore', {
    state: () => ({
        address: '',
        info: {
            firstname: '',
            lastname: '',
            avatar: '',
            email: '',
        } as IUserBio,
        isUserLoggedIn: false,
        _callbackWhenLoggedIn: [] as (() => void)[],
        balance: '0',
    }),

    getters: {
        accountAddress: (state) => {
            if (state.address.trim().length === 0) return userAccountAddress();
            return state.address;
        },
        userBio: (state) => state.info,
        username: (state) => `${state.info.firstname} ${state.info.lastname}`,
        email: (state) => state.info.email,
        avatar: (state) => state.info.avatar,
        _isStoreAddressEmpty: (state) => state.address.trim().length === 0,
    },
    actions: {
        updateState(info: IUserBio, address: string): void {
            this.address = address;
            this.info = info;
        },

        async registerUser(
            user: IUser,
            password: string,
            errCallback?: ErrorCallbackType,
        ): Promise<boolean> {
            if (
                validateAddress(user.address, errCallback)
                && validateFirstName(user.info.firstname, errCallback)
                && validateLastName(user.info.lastname, errCallback)
                && validateEmail(user.info.email, errCallback)
            ) {
                const temp: IUser = {
                    ...user,
                    filesystem: useFSStore().serialize(),
                    password,
                };
                try {
                    await registerUserHelper(temp);
                    await this._setUser(temp);
                    return true;
                } catch (e) {
                    notifyNeg(e);
                }
            }
            return false;
        },

        _setLoggedIn(): void {
            this.isUserLoggedIn = true;
            this._callCallback();
        },

        async getAccountBalance(account: string): Promise<string> {
            if (account.trim().length === 0) return '0';
            const web = ShareableStorage._web;
            if (!web) {
                notifyNeg('Unable to get balance because "ShareableStorage" is not initialized.');
                return '0';
            }

            try {
                const balance = await web.eth.getBalance(account);
                return fromWei(balance);
            } catch (e) {
                notifyNeg(e);
                return '0';
            }
        },

        async updateBalance(): Promise<void> {
            this.balance = await this.getAccountBalance(this.accountAddress);
        },

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        async login(address: string, password: string): Promise<boolean> {
            try {
                const user = await loginUser(address, password);
                await this._setUser(user);
                notifyPos('Logged in successfully');
                return true;
            } catch (e) {
                notifyNeg(e);
                return false;
            }
        },

        _callCallback(): void {
            this._callbackWhenLoggedIn.forEach((el) => el());
            this._callbackWhenLoggedIn = [];
        },

        notifyWhenLogged(callback: () => void): void {
            if (this.isUserLoggedIn) {
                callback();
            }
            this._callbackWhenLoggedIn.push(callback);
        },

        async fetchUser(address?: string): Promise<boolean> {
            const account = address || this.accountAddress || '';
            if (account.trim().length === 0) return false;
            try {
                const user = await getUser(account) as IStrictUser;
                await this._setUser(user);
                return true;
            } catch (e) {
                notifyNeg(e);
                return false;
            }
        },

        async _setUser(user: IUser): Promise<void> {
            if (!checkUserInfo(user as unknown as Record<string, unknown>)) {
                throw new Error('malformed user data');
            }
            if (user.filesystem) useFSStore().deserialize(user.filesystem);
            this.updateState(user.info, user.address);
            this.balance = await this.getAccountBalance(user.address);
        },

        logout(callback?: () => void): void {
            signOutUser(() => {
                if (callback) callback();
                useFSStore().reset();
                this.isUserLoggedIn = false;
                notifyPos('Logged out successfully');
            });
        },
    },
});

export default useAccountStore;
