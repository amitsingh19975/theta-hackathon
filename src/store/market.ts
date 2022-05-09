import {
    addItemToMarket, getItemFromMarket, getItemsFromMarket, getUser,
} from '@/scripts/db';
import { IUser, IUserBio } from '@/scripts/user';
import { notifyInfo, notifyNeg, notifyPos } from '@/scripts/utils';
import { defineStore } from 'pinia';

export interface IField{
    name: string;
    type: string;
    desc: string;
}

export interface IPrice {
    amount: string;
    unit: string;
}

export interface IFuntion{
    name: string;
    params: IField[];
    returnVal: string;
}

export interface IItem {
    contractAddress: string;
    address: string;
    size: number;
    name: string;
    schema: string;
    fields: IField[];
    desc: string;
    type: 'database'|'img';
    prices: {
        read: IPrice,
        readWrite: IPrice,
    };
}

export interface IMarket {
    items: IItem[];
}

const filter = (items: IItem[], address: string) => items.filter((el) => el.address === address);

const useMarketStore = defineStore('useMarketStore', {
    state: () => ({
        items: [] as IItem[],
    }),

    getters: {
        itemsByAddress: (state) => (address: string) => filter(state.items, address),
    },
    actions: {
        async addItem(item: IItem): Promise<boolean> {
            try {
                await addItemToMarket(item);
                notifyPos('Added to the market successfully');
            } catch (e) {
                notifyNeg(e);
            }
            this.items.push(item);
            return true;
        },

        async getUser(account: string): Promise<IUserBio> {
            try {
                const user = await getUser(account) as IUser;
                return user.info;
            } catch (e) {
                notifyNeg(e);
                return {
                    firstname: 'NONE',
                    lastname: 'NONE',
                    avatar: '',
                    email: 'NONE',
                };
            }
        },

        async findItem(contractAddress: string): Promise<IItem | undefined> {
            try {
                return await getItemFromMarket(contractAddress);
            } catch {
                return undefined;
            }
        },

        async loadItems(): Promise<boolean> {
            try {
                this.items = await getItemsFromMarket();
                return true;
            } catch (e) {
                notifyInfo(e);
                this.items = [];
                return false;
            }
        },
    },
});

export default useMarketStore;
