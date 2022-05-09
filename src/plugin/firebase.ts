/* eslint-disable max-len */
/* eslint-disable no-restricted-syntax */
/* eslint-disable import/no-extraneous-dependencies */
import { Plugin } from 'vite';
import { IncomingMessage, ServerResponse } from 'http';
import admin from 'firebase-admin';
import { getAuth } from 'firebase-admin/auth';
import bcrypt from 'bcrypt';
import { IStrictUser } from '../scripts/user';
import { addUser, getUser } from '../scripts/db';
import { readData, writeError } from './utils';

import serviceAccount from './serviceAccountKey.json';
import { ErrorCode } from './error';

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount as Record<string, string>),
    databaseURL: 'https://theta-ae3f5-default-rtdb.asia-southeast1.firebasedatabase.app',
});

const BASE_PATH = '/firebase';
const makePath = (path: string) => `${BASE_PATH}/${path}`;

const checkUserObject = (data: Record<string, unknown>) => {
    const {
        address,
        info,
        filesystem,
        password,
    } = data;

    if (typeof address !== 'string' || address.length === 0) return ErrorCode.ADDRESS;
    if (typeof filesystem !== 'string' || filesystem.length === 0) return ErrorCode.FILESYSTEM;
    if (typeof password !== 'string' || password.length < 6) return ErrorCode.PASSWORD;
    if (typeof info !== 'object') return ErrorCode.INFO;

    const {
        firstname,
        lastname,
        avatar,
        email,
    } = info as Record<string, unknown>;

    if (typeof firstname !== 'string' || firstname.length === 0) return ErrorCode.FIRSTNAME;
    if (typeof lastname !== 'string' || lastname.length === 0) return ErrorCode.LASTNAME;
    if (typeof avatar !== 'string') return ErrorCode.AVATAR;
    if (typeof email !== 'string' || email.length === 0) return ErrorCode.EMAIL;

    return undefined;
};

const checkLoginObject = (data: Record<string, unknown>) => {
    const {
        address,
        password,
    } = data;

    if (typeof address !== 'string' || address.length === 0) return ErrorCode.ADDRESS;
    if (typeof password !== 'string' || password.length < 6) return ErrorCode.PASSWORD;

    return undefined;
};

const doesUserExists = async (account: string) => {
    try {
        await getUser(account);
        return true;
    } catch {
        return false;
    }
};

const hashPassword = async (password: string) => {
    const salt = await bcrypt.genSalt();
    return bcrypt.hash(password, salt);
};

const registerUser = async (req: IncomingMessage, res: ServerResponse) => {
    const data = await readData(req);
    try {
        const errOr = checkUserObject(data);
        if (typeof errOr !== 'undefined') {
            writeError(res, errOr, 200);
            return;
        }

        const user = data as IStrictUser;
        const userID = user.address;
        if (await doesUserExists(userID)) {
            writeError(res, ErrorCode.EXISTING_USER, 200);
            return;
        }

        user.password = await hashPassword(user.password);
        await addUser(user);

        const token = await getAuth().createCustomToken(userID);

        res.end(JSON.stringify({
            token,
            user: {
                address: user.address,
                info: user.info,
                filesystem: user.filesystem,
            },
        }));
    } catch (e) {
        writeError(res, {
            code: -2,
            message: (e as Error).message,
        }, 400);
    }
};

const getUserIfExists = async (userID: string) => {
    try {
        const res = await getUser(userID) as IStrictUser;
        return res;
    } catch {
        return undefined;
    }
};

const loginUser = async (req: IncomingMessage, res: ServerResponse) => {
    const data = await readData(req);
    try {
        const errOr = checkLoginObject(data);
        if (typeof errOr !== 'undefined') {
            writeError(res, errOr, 200);
            return;
        }

        const user = data as { address: string, password: string };
        const userID = user.address;
        const storedUser = await getUserIfExists(userID);
        if (typeof storedUser === 'undefined') {
            writeError(res, ErrorCode.USER_DOES_NOT_EXISTS, 200);
            return;
        }

        if (typeof storedUser.password !== 'string') {
            writeError(res, {
                code: 0,
                message: 'user data is corrupted',
            }, 500);
            return;
        }

        if (!await bcrypt.compare(user.password, storedUser.password)) {
            writeError(res, ErrorCode.PASSWORD_MISMATCH, 200);
            return;
        }

        const token = await getAuth().createCustomToken(userID);

        res.end(JSON.stringify({
            token,
            user: {
                address: storedUser.address,
                info: storedUser.info,
                filesystem: storedUser.filesystem,
            },
        }));
    } catch (e) {
        writeError(res, {
            code: -2,
            message: (e as Error).message,
        }, 400);
    }
};

export default () => ({
    name: 'firebase',
    configureServer: (server) => {
        server.middlewares.use(makePath('register'), registerUser);
        server.middlewares.use(makePath('login'), loginUser);
    },
} as Plugin);
