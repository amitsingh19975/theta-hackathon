module.exports = {
    env: {
        browser: true,
        es2021: true,
    },
    parser: 'vue-eslint-parser',
    extends: [
        'eslint:recommended',
        'plugin:vue/vue3-essential',
        'airbnb-base',
        'plugin:@typescript-eslint/recommended',
    ],
    parserOptions: {
        ecmaVersion: 'latest',
        parser: '@typescript-eslint/parser',
        sourceType: 'module',
        warnOnUnsupportedTypeScriptVersion: false,
    },
    plugins: [
        'vue',
        '@typescript-eslint',
    ],
    rules: {
        indent: ['error', 4],
        'no-underscore-dangle': 'off',
        'lines-between-class-members': 'off',
        'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
        'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
        'import/extensions': 'off',
    },
    settings: {
        'import/resolver': {
            alias: {
                map: [
                    ['@', './src'],
                ],
                extensions: ['.js', '.vue', '.ts'],
            },
        },
    },
};
