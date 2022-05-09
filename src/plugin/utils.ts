import { IncomingMessage, ServerResponse } from 'http';

type ErrorObjType = { code: number, message: string };

export const writeError = (res: ServerResponse, errObj: ErrorObjType, status: number) => {
    const responseJSON = {
        error: errObj,
    };
    const response = JSON.stringify(responseJSON);
    res.writeHead(status, {
        'Content-Length': Buffer.byteLength(response),
        'Content-Type': 'text/plain',
    }).end(response);
};

export const writeOk = (res: ServerResponse, data?: unknown) => {
    const response = JSON.stringify(data);
    res.writeHead(200, {
        'Content-Length': Buffer.byteLength(response),
        'Content-Type': 'text/plain',
    }).end(response);
};

export const readData = async (req: IncomingMessage) => {
    const buffer = [];
    // eslint-disable-next-line no-restricted-syntax
    for await (const chunk of req) {
        buffer.push(chunk);
    }
    return JSON.parse(Buffer.concat(buffer).toString());
};
