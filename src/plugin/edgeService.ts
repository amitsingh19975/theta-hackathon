/* eslint-disable max-len */
/* eslint-disable no-restricted-syntax */
/* eslint-disable import/no-extraneous-dependencies */
import { Plugin } from 'vite';
import axios, { AxiosError } from 'axios';
import { IncomingMessage, ServerResponse } from 'http';
import { readData, writeError, writeOk } from './utils';
import { ErrorCode } from './error';

let edgeStoreURL = '';

const edgeStoreMW = async (req: IncomingMessage, res: ServerResponse) => {
    const data = await readData(req);
    try {
        const response = await axios.post(edgeStoreURL, data);
        res.end(JSON.stringify(response.data));
    } catch (e) {
        const err = (e as AxiosError);
        writeError(res, {
            code: ErrorCode.AXIOS.code,
            message: (e as Error).message,
        }, err.response?.status || 400);
    }
};

const edgeStoreUpdateURL = async (req: IncomingMessage, res: ServerResponse) => {
    try {
        const data = await readData(req);
        edgeStoreURL = data.data as string;
        writeOk(res, 'OK');
    } catch (e) {
        writeError(res, {
            code: ErrorCode.CORRUPTED_DATA.code,
            message: (e as Error).message,
        }, 400);
    }
};

export default () => ({
    name: 'edgeStore',
    configureServer: (server) => {
        server.middlewares.use('/edgestore/update', edgeStoreUpdateURL);
        server.middlewares.use('/edgestore', edgeStoreMW);
    },
} as Plugin);
