/* eslint-disable max-len */
import { email } from '@vee-validate/rules';
import prettier from 'prettier';
import parserGraphql from 'prettier/parser-graphql';
import { Notify } from 'quasar';

import {
    farFolderOpen,
    fasDatabase,
    farImage,
    fasQuestion,
    fasPlus,
} from '@quasar/extras/fontawesome-v5';

import { pathToComponents } from 'theta_database/src/path';
import { File } from 'theta_database/src/fs';
import { Unit } from 'web3-utils';
import Big from 'big.js';
import ShareableStorage from 'theta_database/src/contract';
import ThetaWallet from './thetaWallet';

Big.DP = 30;

export type ErrorCallbackType = (err: string) => void;
type ValidatorCallbackType = <T extends string>(val: T) => void|Error

const checkForError = <T extends string>(
    val: T,
    validator: ValidatorCallbackType,
    errCallback?: ErrorCallbackType) => {
    const res = validator(val);
    if (res instanceof Error) {
        if (errCallback) errCallback(res.message);
        return false;
    }
    return true;
};

export const validateAddress = (address: string, errCallback?: ErrorCallbackType) => checkForError<string>(address, (addr) => {
    const temp = addr.trim();
    if (temp.length === 0) return new Error('\'Address\' found to be empty');
    return /^(0x)[0-9a-fA-F]+$/.test(temp) ? undefined : new Error('Address must be a hex string');
}, errCallback);

export const validateString = (name: string, val: string, errCallback?: ErrorCallbackType) => checkForError<string>(val, (str) => {
    const temp = str.trim();
    return temp.length === 0 ? new Error(`'${name}' is empty, please check!`) : undefined;
}, errCallback);

export const validateFirstName = (name: string, errCallback?: ErrorCallbackType) => validateString('First Name', name, errCallback);
export const validateLastName = (name: string, errCallback?: ErrorCallbackType) => validateString('Last Name', name, errCallback);
export const validateEmail = (addr: string, errCallback?: ErrorCallbackType) => {
    if (!email(addr)) {
        if (errCallback) errCallback('\'Email\' is not valid, please check!');
        return false;
    }
    return true;
};

export const limitText = (text: string, len = 250) => {
    if (text.length > len) {
        return `${text.substring(0, len)}...`;
    }
    return text;
};

export type FormatterLangType = 'graphql' | 'json';

export const formatLang = (lang: FormatterLangType, code: string) => {
    try {
        const plugins: prettier.Plugin<unknown>[] = lang === 'graphql' ? [parserGraphql] : [];
        return prettier.format(code, { parser: lang, plugins });
    } catch (_) {
        return code;
    }
};

type NotifyType = 'negative' | 'info' | 'warning' | 'positive' | 'ongoing';

const notifyX = (type: NotifyType, message: string|unknown) => {
    if (message instanceof Error) Notify.create({ type, message: message.message });
    else if (typeof message === 'string') Notify.create({ type, message });
};

export const notifyPos = (mess: string|unknown) => notifyX('positive', mess);
export const notifyLoading = (mess: string|unknown) => notifyX('ongoing', mess);
export const notifyNeg = (mess: string|unknown) => notifyX('negative', mess);
export const notifyInfo = (mess: string|unknown) => notifyX('info', mess);
export const notifyWarning = (mess: string|unknown) => notifyX('warning', mess);

interface IFileType {
    name: string;
    icon: string;
}

export const fileIcons = {
    folder: farFolderOpen,
    image: farImage,
    database: fasDatabase,
    unknown: fasQuestion,
    new: fasPlus,
};

export const getFileTypes = () => [
    {
        name: 'Folder',
        icon: fileIcons.folder,
    },
    // {
    //     name: 'Image',
    //     icon: fileIcons.image,
    // },
    {
        name: 'Database',
        icon: fileIcons.database,
    },
] as IFileType[];

export const isValidFSName = (name: string) => pathToComponents(name).length === 1;

export const fromFileToTypeString = (file: File) => {
    if (file.isTable()) return 'Table';
    if (file.isImage()) return 'Image';
    if (file.isVideo()) return 'Video';
    return 'unknown';
};

export const ConnectionState = {
    NONE: 0,
    CONNECTING: 1,
    FAILED: 2,
    SUCCESS: 3,
    SIZE: 4,
};

export type TFUELUnitType =
    'wei'
    |'kwei'
    |'mwei'
    |'gwei'
    |'MicroTFUEL'
    |'MilliTFUEL'
    |'TFUEL'
    |'KTFUEL'
    |'MTFUEL'
    |'GTFUEL'
    |'TTFUEL';

type UnitValueType = { tfuelUnit?: TFUELUnitType, unit: Unit, val: Big };
const unitValues: UnitValueType[] = [
    {
        unit: 'wei',
        val: new Big(1),
    },
    {
        unit: 'kwei',
        val: new Big('1000'),
    },
    {
        unit: 'mwei',
        val: new Big('1000000'),
    },
    {
        unit: 'gwei',
        val: new Big('1000000000'),
    },
    {
        tfuelUnit: 'MicroTFUEL',
        unit: 'microether',
        val: new Big('1000000000000'),
    },
    {
        tfuelUnit: 'MilliTFUEL',
        unit: 'milliether',
        val: new Big('1000000000000000'),
    },
    {
        tfuelUnit: 'TFUEL',
        unit: 'ether',
        val: new Big('1000000000000000000'),
    },
    {
        tfuelUnit: 'KTFUEL',
        unit: 'kether',
        val: new Big('1000000000000000000000'),
    },
    {
        tfuelUnit: 'MTFUEL',
        unit: 'mether',
        val: new Big('1000000000000000000000000'),
    },
    {
        tfuelUnit: 'GTFUEL',
        unit: 'gether',
        val: new Big('1000000000000000000000000000'),
    },
    {
        tfuelUnit: 'TTFUEL',
        unit: 'tether',
        val: new Big('1000000000000000000000000000000'),
    },
];

export const getUnits = () => unitValues.map((el) => el.tfuelUnit || el.unit);

const toNormalForm = (big: string) => {
    const idx = big.indexOf('e');
    if (idx < 0) return big;
    const pow = Number.parseInt(big.substring(idx + 1), 10);
    let number = big.substring(0, idx);
    let dotPos = number.indexOf('.');
    if (dotPos < 0) dotPos = number.length;

    const p1 = number.substring(0, dotPos);
    const p2 = number.substring(dotPos + 1);
    number = p1 + p2;

    if (pow - p2.length > 0) {
        number += '0'.repeat(pow - p2.length);
    } else if (pow < 0) {
        const ppow = -pow - p1.length;
        if (ppow > 0) {
            number = `0.${'0'.repeat(ppow)}${number}`;
        }
    }
    return number;
};

const findPred = (val: UnitValueType, el: TFUELUnitType) => (val.tfuelUnit || val.unit) === el;

export const findTFUELUnit = (tfuelUnit: TFUELUnitType) => {
    const unit = unitValues.find((el) => findPred(el, tfuelUnit));
    if (!unit) return unitValues[0].unit;
    return unit.unit;
};

export const conv = (val: string, from: TFUELUnitType, to: TFUELUnitType) => {
    const units = unitValues.filter((el) => findPred(el, to) || findPred(el, from));
    if (units.length !== 2) return val;
    const toUnit = findPred(units[0], to) ? units[0].val : units[1].val;
    const fromUnit = findPred(units[0], from) ? units[0].val : units[1].val;
    const ratio = fromUnit.div(toUnit);
    const bVal = new Big(val).mul(ratio);
    return toNormalForm(bVal.toString());
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const getAccountsFromTheta = async () => {
    try {
        let accounts = [] as string[];
        const res = await ThetaWallet.connect();
        if (!res) return accounts;
        accounts = await ThetaWallet.requestAccounts();
        await ThetaWallet.disconnect();
        return accounts;
    } catch {
        await ThetaWallet.disconnect();
        return undefined;
    }
};

interface IRequestArguments {
    method: string;
    params?: unknown[] | object;
}

type MetamaskProviderType = typeof window & {
    ethereum: {
        request: (args: IRequestArguments) => Promise<unknown>,
    }
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const getAccountsFromMetamask = async () => {
    try {
        const provider = (window as MetamaskProviderType).ethereum;
        if (typeof provider === 'undefined') return undefined;
        const res = await provider.request({ method: 'eth_requestAccounts' });
        if (Array.isArray(res) && typeof res[0] === 'string') {
            return res as string[];
        }
        return undefined;
    } catch {
        return undefined;
    }
};

const getAccountsFromWeb3 = async () => {
    try {
        const web = ShareableStorage._web;
        if (!web) throw new Error();
        const res = await web.eth.getAccounts();
        return res || [];
    } catch {
        return [] as string[];
    }
};

const getAccountsHelper = async () => {
    // Takes too long, just to check if the ThetaWallet is installed or not.
    // let accountsOr = await getAccountsFromTheta();
    // if (accountsOr !== undefined) return accountsOr;

    // const accountsOr = await getAccountsFromMetamask();
    // if (accountsOr !== undefined) return accountsOr;

    const res = await getAccountsFromWeb3();
    return res;
};

export const getAccounts = async () => {
    const res = await getAccountsHelper();
    return [...new Set(res)];
};
