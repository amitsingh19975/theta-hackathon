import axios from 'axios';
import {
    getAuth, signInWithCustomToken, signOut, onAuthStateChanged,
} from 'firebase/auth';
import useAccountStore from '@/store/account';
import router from '@/router';
import { notifyNeg } from './utils';

export interface IUserBio {
    firstname: string,
    lastname: string,
    avatar: string,
    email: string,
}

export interface IUser {
    address: string,
    info: IUserBio,
    filesystem?: string,
    password?: string,
}

export interface IStrictUser {
    address: string,
    info: IUserBio,
    filesystem: string,
    password: string,
}

export const isLogged = () => getAuth().currentUser !== null;
export const userAccountAddress = () => getAuth().currentUser?.uid || '';

onAuthStateChanged(getAuth(), async (user) => {
    if (user) {
        await useAccountStore().fetchUser(user.uid);
        useAccountStore()._setLoggedIn();
        router.push({ path: '/home' });
    } else {
        useAccountStore().$reset();
    }
});

export const registerUserHelper = async (user: IUser) => {
    const auth = getAuth();
    const res = await axios.post('/firebase/register', user);
    const { data } = res;
    if (typeof data.error !== 'undefined') {
        throw new Error(data.error.message);
    }
    return signInWithCustomToken(auth, data.token);
};

export const signOutUser = (callback?: () => void) => {
    signOut(getAuth()).then(() => {
        if (callback) callback();
        router.push({ path: '/' });
    }).catch((err) => notifyNeg(err));
};

export const loginUser = async (address: string, password: string) => {
    const res = await axios.post('/firebase/login', { address, password });
    const auth = getAuth();
    const { data } = res;
    if (typeof data.error !== 'undefined') {
        throw new Error(data.error.message);
    }
    await signInWithCustomToken(auth, data.token);
    return data.user;
};

export const fetchUserData = async () => {
    const auth = getAuth();
    if (auth.currentUser) {
        await useAccountStore().fetchUser(auth.currentUser.uid);
    } else {
        notifyNeg('unable to fetch user');
    }
};
