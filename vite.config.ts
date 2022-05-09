/* eslint import/no-extraneous-dependencies: 0 */

import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { quasar, transformAssetUrls } from '@quasar/vite-plugin';
import { EsLinter, linterPlugin, TypeScriptLinter } from 'vite-plugin-linter';
import * as Path from 'path';
import GlobalsPolyfills from '@esbuild-plugins/node-globals-polyfill';
import NodeModulesPolyfills from '@esbuild-plugins/node-modules-polyfill';
import edgeService from './src/plugin/edgeService';
import firebase from './src/plugin/firebase';

/* eslint import/no-extraneous-dependencies: 2 */
export default defineConfig((configEnv) => ({
    plugins: [
        vue({
            template: { transformAssetUrls },
        }), quasar({
            sassVariables: '@/assets/scss/main',
        }),
        linterPlugin({
            include: ['./src/**/*.ts', './src/**/*.tsx'],
            exclude: ['node_modules', './src/database/**/*'],
            linters: [new EsLinter({ configEnv }), new TypeScriptLinter()],
        }),
        edgeService(),
        firebase(),
    ],
    resolve: {
        alias: {
            '@': Path.resolve(__dirname, './src'),
            db: Path.resolve(__dirname, './src/database/src'),
            web3: 'web3/dist/web3.min.js',
        },
        extensions: ['', '.js', '.ts', '.vue'],
    },
    optimizeDeps: {
        esbuildOptions: {
            plugins: [
                NodeModulesPolyfills(),
                GlobalsPolyfills({
                    process: true,
                    buffer: true,
                }),
            ],
            define: {
                global: 'globalThis',
            },
        },
    },
}));
