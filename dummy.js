/* eslint-disable no-await-in-loop */
/* eslint-disable @typescript-eslint/no-var-requires */
const { genSaltSync, hashSync } = require('bcrypt');
const admin = require('firebase-admin');
const { exit } = require('process');

const serviceAccount = require('./src/plugin/serviceAccountKey.json');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: 'https://theta-ae3f5-default-rtdb.asia-southeast1.firebasedatabase.app',
});

const db = admin.database();

const hashPassword = (password) => {
    const salt = genSaltSync();
    return hashSync(password, salt);
};

const DEFAULT_PASSWORD = '123456';
const HASHED_PASSWORD = hashPassword(DEFAULT_PASSWORD);

const testAccounts = [
    { address: '0x19E7E376E7C213B7E7e7e46cc70A5dD086DAff2A', password: HASHED_PASSWORD },
    { address: '0x1563915e194D8CfBA1943570603F7606A3115508', password: HASHED_PASSWORD },
    { address: '0x5CbDd86a2FA8Dc4bDdd8a8f69dBa48572EeC07FB', password: HASHED_PASSWORD },
];

const filesystem = '{"name":"","parent":"","type":2,"children":[],"size":0,"isRoot":true}';

const users = [
    {
        ...testAccounts[0],
        info: {
            firstname: 'Amit',
            lastname: 'Singh',
            avatar: 'https://cdn.pixabay.com/photo/2015/04/23/22/00/tree-736885_1280.jpg',
            email: 'amit@gmail.com',
        },
        filesystem,
    },
    {
        ...testAccounts[1],
        info: {
            firstname: 'Rahul',
            lastname: 'Singh',
            avatar: 'https://cdn.pixabay.com/photo/2018/01/14/23/12/nature-3082832_1280.jpg',
            email: 'rahul@gmail.com',
        },
        filesystem,
    },
    {
        ...testAccounts[2],
        info: {
            firstname: 'Vineet',
            lastname: 'Kumar',
            avatar: 'https://cdn.pixabay.com/photo/2015/11/16/16/28/bird-1045954_1280.jpg',
            email: 'vineet@outlook.com',
        },
        filesystem,
    },
];

const addUser = async (user) => {
    const path = `users/${user.address}`;
    try {
        await db.ref(path).set(user);
    } catch (e) {
        console.error(e);
    }
};

const createUser = async (user) => {
    try {
        await addUser(user);
        console.info(`User[${user.info.firstname} ${user.info.lastname}]{ address: ${user.address}, password: ${DEFAULT_PASSWORD} }`);
    } catch {
        // DO NOTHING
    }
};

const main = async () => {
    try {
        await db.ref().remove();
        await db.ref('empty_tag').set('empty');
        const total = new Array(users.length).fill(false);
        users.forEach(async (el, idx) => {
            await createUser(el);
            total[idx] = true;
        });

        setTimeout(() => {
            if (total.reduce((p, c) => p + c) === users.length) exit(0);
        }, 1000);
    } catch (e) {
        console.error(e);
    }
};

main();
