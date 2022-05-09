<template>
    <div class="editor">
        <q-skeleton v-if="isLoading" dark class="fit"/>
        <div
            class="fit"
            ref="editorApp"
        />
    </div>
</template>

<script lang="ts">

import { defineComponent, ref } from 'vue';
import { notifyNeg } from '@/scripts/utils';
import getOrCreateEditor from '@/scripts/editor';

export default defineComponent({
    name: 'GraphQLEditor',
    emits: ['value'],
    props: {
        default: {
            type: String,
            required: false,
        },
    },
    setup() {
        const editorApp = ref<HTMLElement|null>(null);
        const editorContainer = ref<HTMLElement|null>(null);
        const isLoading = ref(true);
        return {
            editorApp,
            editorContainer,
            code: ref(''),
            isLoading,
        };
    },
    methods: {
        emitFn(val: string): void {
            if (val.trim() !== this.code) {
                this.code = val;
                this.$emit('value', val);
            }
        },
        async initEditor(el: HTMLElement) {
            try {
                const ed = await getOrCreateEditor(el, this.emitFn);
                ed?.setValue(this.default || '');
                this.isLoading = false;
                this.$forceUpdate();
            } catch (e) {
                notifyNeg(e);
            }
            this.code = this.default || '';
        },
    },
    mounted() {
        if (this.editorApp) {
            this.initEditor(this.editorApp);
        } else {
            notifyNeg('Unable to initialize GraphQL language Editor');
        }
    },
    unmounted() {
        // disposeEditor();
    },
    watch: {
    },
});

</script>

<style lang="scss" scoped>

.editor {
    overflow: scroll;
    padding-top: 1rem;
    background-color: #1E1E1E;
}

</style>
