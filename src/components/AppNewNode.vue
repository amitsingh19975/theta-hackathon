<template>
    <div class="q-pa-md q-gutter-sm">
        <q-dialog v-model="dialog" persistent>
            <q-layout
                view="Lhh lpR fff"
                container
                :class="{
                    'new-node-container': true,
                    'no-body': !hasBody,
                    'has-body': hasBody
                }"
            >
                <q-header class="bg-primary new-node-container-header">
                    <q-toolbar>
                        <q-toolbar-title class="new-node-container-header-title">
                            New
                        </q-toolbar-title>
                        <q-btn flat v-close-popup round dense icon="close" />
                    </q-toolbar>
                </q-header>

                <q-page-container class="new-node-container-body">
                    <FileTypePicker
                        :toggle="openFilePicker"
                        @selected="fileType=$event"
                        @closed="openFilePicker = false"
                    />
                    <div class="tool-bar">
                        <AppBtn
                            :icon="getToolBtnIcon"
                            :label="getToolBtnText"
                            color="primary"
                            border
                            style="height:6rem;"
                            size="1.5rem"
                            @click="openFilePicker = true"
                        />
                        <AppInput
                            class="node-name-input"
                            name="fileName"
                            placeholder="File Name"
                            type="text"
                            v-model="inputValue"
                        />
                    </div>
                    <GraphQLEditor
                        v-if="isDb"
                        class="fit node-editor"
                        @value="dbSource = $event"
                        :default="defGQLSchema"
                    />
                    <q-uploader
                        dark
                        v-if="isImage"
                        class="image-uploader"
                        url="http://localhost:4444/upload"
                        label="Restricted to images"
                        accept=".jpg, .png, .gif, .png, image/*"
                        @added="imageAdded"
                        @removed="imageUploaded=false"
                    >
                        <template v-slot:list v-if="!imageUploaded">
                            <div class="image-uploader-body fit">
                                <q-icon :name="fasCloudUploadAlt" size="8rem"/>
                                <div class="text-h4">Drag and Drop</div>
                            </div>
                        </template>
                    </q-uploader>
                    <div class="new-node-btns-body">
                        <q-separator dark inset/>
                        <div class="new-node-btn">
                            <q-btn
                                color="red"
                                size="md"
                                padding="2rem"
                                @click="dialog = false"
                            >
                                Cancel
                            </q-btn>
                            <q-btn
                                color="green"
                                size="md"
                                padding="2rem"
                                @click="createFs()"
                            >
                                Create
                            </q-btn>
                        </div>
                    </div>
                </q-page-container>
            </q-layout>
        </q-dialog>
    </div>
</template>

<script lang="ts">
import { computed, defineComponent, ref } from 'vue';
import { fasEyeDropper, fasCloudUploadAlt } from '@quasar/extras/fontawesome-v5';
import {
    fileIcons, isValidFSName, notifyNeg,
} from '@/scripts/utils';
import {
    FileSystem,
} from 'theta_database/src/fs';

import { mapActions } from 'pinia';
import useFSStore from '@/store/fs';
import GraphQLEditor from './GraphQLEditor.vue';
import FileTypePicker from './FileTypePicker.vue';
import AppInput from './AppInput.vue';
import AppBtn from './AppBtn.vue';

const defGQLSchema = (() => (
    `
# type Person {
#     name: String!
#     phone: Int!
#     city: String
#     dob: String
# }
    `
))();

export default defineComponent({
    name: 'AppNewNode',
    components: {
        GraphQLEditor,
        AppInput,
        FileTypePicker,
        AppBtn,
    },
    props: {
        toggle: {
            type: Boolean,
            required: true,
        },
        root: {
            type: Object,
            required: true,
        },
    },
    emits: ['update:closed', 'update:newNode'],
    setup(props) {
        const dialog = ref(props.toggle);
        const shouldShowDefault = ref(true);
        const loading = ref(true);
        const inputValue = ref('');
        const openFilePicker = ref(false);
        const fileType = ref<Record<string, string>|null>(null);

        const getToolBtnIcon = computed(() => {
            if (fileType.value === null) return fasEyeDropper;
            return fileType.value.icon;
        });

        const getToolBtnText = computed(() => {
            if (fileType.value === null) return 'Pick File Type';
            return fileType.value.name;
        });

        const isDir = computed(() => (fileType.value && fileType.value.name === 'Folder'));
        const isDb = computed(() => (fileType.value && fileType.value.name === 'Database'));
        const isImage = computed(() => (fileType.value && fileType.value.name === 'Image'));
        const hasBody = computed(() => isDb.value || isImage.value);
        const imageUploaded = ref(false);

        const imageAdded = (info: unknown[]) => {
            console.log(info);
            imageUploaded.value = true;
        };

        const dbSource = ref<string>('');
        const editorReq = ref(false);

        return {
            dialog,
            shouldShowDefault,
            loading,
            inputValue,
            openFilePicker,
            fileType,
            fileIcons,
            getToolBtnIcon,
            getToolBtnText,
            isDb,
            isDir,
            isImage,
            hasBody,
            imageUploaded,
            fasCloudUploadAlt,
            imageAdded,
            editorReq,
            dbSource,
            defGQLSchema,
        };
    },
    methods: {
        ...mapActions(useFSStore, ['createFile']),

        async createFs(): Promise<void> {
            try {
                if (this.fileType === null) throw new Error('Please select a File type');
                const dir = (this.root as FileSystem).asDir();
                if (!dir) throw new Error('Only Directory can have children');
                const name = this.inputValue;

                if (!isValidFSName(name)) throw new Error('Please provide a valid name');
                const source = this.dbSource;
                await this.createFile({ isDir: this.isDir, isDB: this.isDb }, name, dir, source);
                this.$emit('update:newNode');
                this.inputValue = '';
                this.fileType = null;
                this.dialog = false;
            } catch (e) {
                notifyNeg(e);
            }
        },
    },
    watch: {
        dialog(val: boolean): void {
            if (!val) this.$emit('update:closed');
        },
        toggle(val: boolean): void {
            this.dialog = val;
        },
    },
});
</script>

<style lang="scss" scoped>

.no-body {
    max-height: 23rem;
}
.has-body {
    max-height: 55rem;

    & .new-node-container-body{
        height: 55rem;
    }
}
.new-node-container{
    background-color: $primary;
    padding: 1rem;
    &-header {
        &-title {
            margin: 1rem;
        }
    }
    &-body{
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 1rem;
        gap:1rem;

        & .tool-bar{
            align-self: flex-start;
            width: 100%;
            display: grid;
            grid-template-columns: 0.4fr 0.8fr;
            grid-template-rows: 1fr;
            gap: 1rem;
            & > * {
                background-color: $primary;
            }
            &-btn {
                padding: 1rem;
                border: 1px solid $outline;

                &-text {
                    margin-left: 1rem;
                }
            }
        }

        & .node-editor {
            // padding: 1rem;
            border: 1px solid $outline;
        }

        & .image-uploader {
            height: 50rem;
            width: 100%;
            border: 1px solid $outline;

            &-body {
                background-color: $secondary;
                display: flex;
                flex-direction: column;
                justify-content: center;
                align-items: center;
                border: 2px dotted white;
                padding: 2rem;
                opacity: 0.8;
            }
        }

        & > *:nth-child(3) {
            margin: 0rem 0 1rem 0;
        }
        & .new-node-btn {
            margin-top: 1rem;
            display: flex;
            justify-content: space-around;
        }

        & .new-node-btns-body {
            align-self: flex-start;
            width: 100%;
        }
    }
}

</style>
