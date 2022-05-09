<template>
    <div class="q-pa-md q-gutter-sm">
        <q-dialog v-model="dialog" persistent>
            <q-layout view="Lhh lpR fff" container class="picker-container">
                <q-header class="bg-primary picker-container-header">
                    <q-toolbar>
                        <q-toolbar-title class="picker-container-header-title">
                            File Picker
                        </q-toolbar-title>
                        <q-btn flat v-close-popup round dense icon="close" />
                    </q-toolbar>
                </q-header>

                <q-page-container class="picker-container-body">
                    <AppFileManager
                        @selected='selectedNode=$event'
                        @currentNode="currentNode=$event"
                    />
                    <q-separator dark/>
                    <AppInput
                        name="fileName"
                        placeholder="Filename"
                        type="text"
                        style="margin-bottom: 1rem"
                        v-model="filename"
                    />
                    <div class="picker-btn">
                        <q-btn
                            color="red"
                            size="md"
                            padding="2rem"
                            @click="notifyCancel"
                        >
                            Cancel
                        </q-btn>
                        <q-btn
                            color="green"
                            size="md"
                            padding="2rem"
                            @click="notifySelected"
                        >
                            Select
                        </q-btn>
                    </div>
                </q-page-container>
            </q-layout>
        </q-dialog>
    </div>
</template>

<script lang="ts">

import { defineComponent, ref } from 'vue';
import { FileSystem, Directory } from 'theta_database/src/fs';
import useFSStore from '@/store/fs';
import AppFileManager from './AppFileManager.vue';
import AppInput from './AppInput.vue';

export default defineComponent({
    name: 'AppFilePicker',
    components: {
        AppFileManager,
        AppInput,
    },
    props: {
        toggle: {
            type: Boolean,
            required: true,
        },
        defaultFilename: {
            type: String,
            required: false,
        },
    },
    emits: ['update:closed', 'selected'],
    setup(props) {
        useFSStore().$reset();

        const dialog = ref(props.toggle);
        const selectedNode = ref<FileSystem|null>(null);
        const currentNode = ref<FileSystem>(Directory.root);
        return {
            dialog,
            maximizedToggle: ref(true),
            selectedNode,
            currentNode,
            filename: ref(props.defaultFilename || ''),
        };
    },
    methods: {
        notifySelected(): void {
            const node = (
                this.selectedNode
                    ? this.selectedNode
                    : this.currentNode
            ) as FileSystem;
            this.$emit('selected', node, this.filename);
        },
        notifyCancel(): void {
            this.$emit('selected', null);
        },
    },
    watch: {
        toggle(val: boolean): void {
            this.dialog = val;
        },

        dialog(val: boolean): void {
            if (!val) this.$emit('update:closed');
        },
    },
});

</script>

<style lang="scss" scoped>

.picker-container{
    height: 55rem;
    background-color: $secondary;
    padding: 1rem;
    &-header {
        &-title {
            margin: 1rem;
        }
    }
    &-body{
        display: flex;
        flex-direction: column;
        height: 55rem;
        padding: 1rem;

        & > *:first-child {
            height: 50rem;
        }

        & > *:nth-child(2) {
            margin: 0rem 0 1rem 0;
        }
        & .picker-btn {
            display: flex;
            justify-content: space-around;
        }
    }
}

</style>
