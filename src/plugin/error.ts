export const ErrorCode = {
    UNKNOWN: {
        code: 0,
        message: 'unknown error',
    },
    EMPTY: {
        code: -1,
        message: 'the user information object is empty',
    },
    ADDRESS: {
        code: -2,
        message: '"address" is missing',
    },
    PASSWORD: {
        code: -3,
        message: '"password" is missing, or it is less than a minumum length',
    },
    FILESYSTEM: {
        code: -4,
        message: '"filesystem" is missing or empty',
    },
    FIRSTNAME: {
        code: -4,
        message: '"firstname" is missing',
    },
    LASTNAME: {
        code: -4,
        message: '"lastname" is missing',
    },
    EMAIL: {
        code: -4,
        message: '"email" address is missing',
    },
    AXIOS: {
        code: -5,
        message: '',
    },
    CORRUPTED_DATA: {
        code: -6,
        message: 'param is corrupted',
    },
    INFO: {
        code: -7,
        message: '"info" is not an object or undefined',
    },
    AVATAR: {
        code: -8,
        message: 'invalid "avatar" found; it must be empty to ends with image extension ("jpeg", "jpg", "gif", or "png")',
    },
    EXISTING_USER: {
        code: -9,
        message: 'user already exists',
    },
    PASSWORD_MISMATCH: {
        code: -10,
        message: 'password mismatch',
    },
    USER_DOES_NOT_EXISTS: {
        code: -11,
        message: 'user does not exists',
    },
};

const errorString = (key: keyof typeof ErrorCode) => JSON.stringify(ErrorCode[key]);

export const isKeyIn = (key: string, obj: Record<string, unknown>) => typeof obj[key] === 'undefined';

export const checkUser = (obj: Record<string, unknown>) => {
    if (!obj || !isKeyIn('info', obj)) return ErrorCode.EMPTY;
    if (!isKeyIn('address', obj)) return ErrorCode.ADDRESS;
    if (!isKeyIn('filesystem', obj)) return ErrorCode.FILESYSTEM;
    if (!isKeyIn('firstname', obj)) return ErrorCode.FIRSTNAME;
    if (!isKeyIn('lastname', obj)) return ErrorCode.LASTNAME;
    if (!isKeyIn('email', obj)) return ErrorCode.EMAIL;
    return undefined;
};

export default errorString;
