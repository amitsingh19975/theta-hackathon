<template>
    <div class="code-block scroll" v-if="!isLoading">
        <div class="header text-h3" v-if="title">{{title}}</div>
        <q-separator dark inset v-if="title"/>
        <highlightjs
            :language="lang === 'json' ? 'json' : 'typescript'"
            class="code-block-code scroll"
            :code="formattedCode"
        />
    </div>
    <q-skeleton v-else dark class="fit"/>
</template>

<script lang="ts">

import { defineComponent, ref } from 'vue';

import { formatLang, FormatterLangType, notifyNeg } from '@/scripts/utils';

const langs: string[] = ['graphql', 'json'];

export default defineComponent({
    name: 'ItemDialogSchema',
    props: {
        code: {
            type: [String, Object],
            required: true,
        },
        lang: {
            type: String,
            required: true,
        },
        title: {
            type: String,
            required: false,
        },
        loading: {
            type: Boolean,
            required: false,
        },
    },
    setup(props) {
        const isLoading = ref(props.loading);
        const formattedCode = ref('');
        const rowInJsonFormat = (data: unknown) => JSON.stringify(data, null, 4);

        const formatCode = () => {
            isLoading.value = true;
            const code = typeof props.code === 'string' ? props.code : rowInJsonFormat(props.code);
            if (!langs.includes(props.lang)) {
                notifyNeg(`Formatter does not support "${props.lang}"`);
                formattedCode.value = code;
                return;
            }
            formattedCode.value = formatLang(props.lang as FormatterLangType, code);
            isLoading.value = false;
        };

        const removeHLJS = () => {
            Array.from(document.querySelectorAll('pre code'))
                .forEach((el) => {
                    el?.classList.remove('hljs');
                    el?.classList.add('scroll');
                });
        };

        return {
            formattedCode,
            removeHLJS,
            isLoading,
            formatCode,
        };
    },
    mounted() {
        // this.removeHLJS();
        this.formatCode();
    },
    watch: {
        code(): void {
            this.formatCode();
            this.removeHLJS();
        },
        loading(val: boolean): void {
            this.isLoading = val;
        },
    },
});
</script>

<style lang="scss" scoped>

.code-block {
    overflow: scroll;
    padding: 1rem;
    &-code {
        margin-top: 1rem;
        padding: 1rem;
        color: #a9b7c6;

        & > * {
            overflow: scroll;
        }

    }
}
.header {
    padding: 1rem;
}

</style>
