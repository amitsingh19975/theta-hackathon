import { createApp } from 'vue';
import router from '@/router/index';
import { createPinia } from 'pinia';
import { Quasar, Notify } from 'quasar';
import quasarIconSet from 'quasar/icon-set/svg-fontawesome-v5';
import '@quasar/extras/fontawesome-v5/fontawesome-v5.css';
import '@quasar/extras/material-icons/material-icons.css';
import 'quasar/src/css/index.sass';
import App from '@/App.vue';
import 'highlight.js/styles/androidstudio.css';
import hljs from 'highlight.js/lib/core';
import hljsVuePlugin from '@highlightjs/vue-plugin';
import ts from 'highlight.js/lib/languages/typescript';
import json from 'highlight.js/lib/languages/json';
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate';
import { defineRule } from 'vee-validate';
import { checkAddressChecksum } from 'web3-utils';
import {
    required, min, confirmed, email,
} from '@vee-validate/rules';
import useURLS from './store/urls';

hljs.registerLanguage('typescript', ts);
hljs.registerLanguage('json', json);

const storageApp = createApp(App);

storageApp.use(router);
storageApp.use(Quasar, {
    plugins: {
        Notify,
    },
    iconSet: quasarIconSet,
    config: {
        notify: {
        },
    },
});

const pinia = createPinia();
pinia.use(piniaPluginPersistedstate);

defineRule('address', (value: unknown) => {
    if (typeof value !== 'string') return false;
    try {
        return checkAddressChecksum(value, useURLS().thetanet.chainID);
    } catch {
        return false;
    }
    // if (value.length < 2) return false;
    // return /^(0x)[0-9a-fA-F]+$/.test(value);
});

defineRule('required', required);
defineRule('min', min);
defineRule('confirmed', confirmed);
defineRule('email', email);

storageApp.use(pinia);
storageApp.use(hljsVuePlugin);

storageApp.mount('#app');

// populate(useMarketStore().items);
// populate(useMarketStore().items);
// populate(useMarketStore().items);
// populate(useMarketStore().items);
// populate(useMarketStore().items);
// populate(useMarketStore().items);
// useMarketStore().items.forEach((el) => addItemToMarket(el));
