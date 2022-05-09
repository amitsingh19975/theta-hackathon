<template>
    <div class="fs fit">
        <div class="fs-path">
            <AppBtn
                :icon="fasArrowLeft"
                color="primary"
                border
                @click="goBack()"
            />
            <AppInput
                name="File Path"
                type="text"
                :value="currPath"
                @input="inputValue = $event"
                @enter="handleEnterKey"
            />
        </div>
        <div v-if="isDir">
            <TableView
                :items="children"
                :icon-getter="getIcon"
                :name-getter="getName"
                :show-new-btn="true"
                @selected="selectedItem = $event"
                @item-clicked="selected(currNode, $event)"
                @remove="removeNode"
            />
            <AppNewNode
                :toggle="newNodeComp"
                @update:closed="newNodeComp = false"
                :root="currNode"
            />
        </div>
        <AppDatabase v-if="isDB" :file-node="currNode" />
    </div>
</template>

<script lang="ts">

import { defineComponent, ref } from 'vue';
import {
    fasArrowLeft,
    fasPlus,
} from '@quasar/extras/fontawesome-v5';
import {
    FileSystem,
} from 'theta_database/src/fs';

import { fileIcons } from '@/scripts/utils';
import { mapState, storeToRefs } from 'pinia';
import useFSStore from '@/store/fs';
import AppInput from './AppInput.vue';
import AppNewNode from './AppNewNode.vue';
import TableView from './TableView.vue';
import AppDatabase from './AppDatabase.vue';
import AppBtn from './AppBtn.vue';

export default defineComponent({
    name: 'AppFileManager',
    components: {
        AppInput,
        AppNewNode,
        TableView,
        AppDatabase,
        AppBtn,
    },
    emits: ['selected', 'currentNode'],
    setup() {
        useFSStore().$reset();

        const getIcon = (node: unknown) => {
            if (node instanceof FileSystem) {
                if (node.isDir()) return fileIcons.folder;
                if (node.isFile()) {
                    if (node.isTable()) return fileIcons.database;
                    if (node.isImage()) return fileIcons.image;
                }
            }
            return fileIcons.unknown;
        };

        const getName = (node: unknown) => {
            if (node instanceof FileSystem) {
                return node.realName;
            }
            return '?';
        };

        const { currentNode: currNode, currPath } = storeToRefs(useFSStore());

        const selectedItem = ref(-1);
        const inputValue = ref('');
        const newNodeComp = ref(false);
        const isDir = ref(currNode.value.isDir());
        const isDB = ref(currNode.value.isFile() && currNode.value.isTable());
        const isImage = ref(currNode.value.isFile() && currNode.value.isImage());

        const setIsVars = () => {
            isDir.value = currNode.value.isDir();
            isDB.value = currNode.value.isFile() && currNode.value.isTable();
            isImage.value = currNode.value.isFile() && currNode.value.isImage();
        };

        const setCurrNode = (newNode: FileSystem) => {
            useFSStore().setCurrNode(newNode, setIsVars);
        };

        const resetSelection = () => { selectedItem.value = -1; };

        const openFolder = (node: unknown, index: number) => {
            const res = useFSStore().openFolder(node, index, resetSelection);
            return res;
        };

        const selected = (node: unknown, idx: number) => {
            if (idx < 0) {
                newNodeComp.value = true;
                return;
            }
            const temp = openFolder(node, idx);
            if (temp) setCurrNode(temp);
        };

        const goBack = () => {
            useFSStore().goBack(() => {
                resetSelection();
                setIsVars();
            });
        };

        const handleEnterKey = (value: string) => {
            useFSStore().handleEnterKey(value, resetSelection);
        };

        return {
            currNode,
            getIcon,
            openFolder,
            fasArrowLeft,
            currPath,
            selectedItem,
            selected,
            goBack,
            handleEnterKey,
            inputValue,
            fasPlus,
            newNodeComp,
            getName,
            isDir,
            isDB,
            isImage,
        };
    },
    computed: {
        ...mapState(useFSStore, ['children']),
    },
    methods: {
        async removeNode(idx: number): Promise<void> {
            await useFSStore().removeNodeAt(idx);
        },
    },
    watch: {
        currNode(node: FileSystem): void {
            this.$emit('currentNode', node);
        },
        selectedItem(idx: number): void {
            const dir = this.currNode.asDir();
            if (dir && dir.children.length > idx) {
                if (idx < 0) this.$emit('selected', null);
                else this.$emit('selected', dir.children[idx]);
            }
        },
    },
});

</script>

<style lang="scss" scoped>

.fs {
    overflow: scroll;
    display: flex;
    flex-direction: column;
    gap: 1rem;
    padding-top: 1rem;
    // border: 1px solid white;
    &-path {
        display: grid;
        grid-template-columns: 0.2fr 0.8fr;
        grid-template-rows: 1fr;
        gap: 1rem;

        & > * {
            background-color: $primary;
        }
    }
    .right-menu {
        min-width: 100rem;
    }
}

</style>
