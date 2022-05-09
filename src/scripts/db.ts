import { IItem } from '@/store/market';
import {
    getDatabase, ref, get, update, set,
} from 'firebase/database';
import firebaseApp from './firebaseApp';
import { IStrictUser } from './user';

const db = getDatabase(firebaseApp);

export const MARKET_PATH = 'market';
export const USER_PATH = 'users';

const getRef = (path: string) => ref(db, path);

const readFromDB = async (path: string) => get(getRef(path));

export const getItemsFromMarket = async () => {
    const res = await readFromDB(MARKET_PATH);
    if (res.exists()) {
        return Object.values(res.val()) as IItem[];
    }
    return [];
};

export const getItemFromMarket = async (contractAddress: string) => {
    if (contractAddress.length === 0) {
        throw new Error('contract Address cannot be empty');
    }
    const path = `/${MARKET_PATH}/${contractAddress}`;
    const res = await readFromDB(path);
    if (res.exists()) {
        return res.val() as IItem;
    }
    throw new Error('Item does not exists, please check!');
};

export const addItemToMarket = async (data: IItem) => {
    if (typeof data.contractAddress === 'undefined' && data.contractAddress === null) {
        throw new Error('contract Address cannot be undefined or null');
    }
    const path = `/${MARKET_PATH}/${data.contractAddress}`;
    let exists = false;
    try {
        await getItemFromMarket(data.contractAddress);
        exists = true;
    } catch {
        exists = false;
    }
    if (exists) throw new Error('Item already exists');
    await set(getRef(path), data);
};

export const getUser = async (address: string) => {
    if (!address) throw new Error('Address is empty, please check');
    const res = await readFromDB(`${USER_PATH}/${address}`);
    if (res.exists()) return res.val();
    throw new Error(`user["${address}"] not found, please check address`);
};

export const addUser = async (user: IStrictUser) => {
    if (user.address.trim().length === 0) {
        throw new Error('address is empty, please check');
    }
    const path = `${USER_PATH}/${user.address}`;
    await set(getRef(path), user);
};

export const updateFS = async (address: string, fs: string) => {
    if (fs.trim().length === 0) {
        throw new Error('fs is a empty string, please check');
    }
    if (address.trim().length === 0) {
        throw new Error('address is empty, please check');
    }
    const path = `${USER_PATH}/${address}/filesystem`;
    const updates: Record<string, string> = {};
    updates[path] = fs;
    await update(ref(db), updates);
};

export const isConnected = async () => {
    const conRef = getRef('empty_tag');
    const errOr = await get(conRef);
    if (errOr.exists()) {
        return true;
    }
    throw new Error('unable to check connection state');
};

export default db;
