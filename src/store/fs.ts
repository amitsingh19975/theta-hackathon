import { updateFS } from '@/scripts/db';
import { notifyNeg } from '@/scripts/utils';
import { defineStore } from 'pinia';
import { cdWithBothFileAndDirAsLastChild } from 'theta_database/src/commands/cd';
import {
    FileSystem, Directory, deserializeFileSystem, makeTable, makeDir,
} from 'theta_database/src/fs';
import TableFile from 'theta_database/src/fsInternal/tableFile';
import { Path } from 'theta_database/src/path';
import useAccountStore from './account';

const getChildren = (node: FileSystem) => node.asDir()?.children || [];

const useFSStore = defineStore('FSStore', {
    state: () => ({
        root: Directory.root as FileSystem,
        currentNode: Directory.root as FileSystem,
        children: getChildren(Directory.root) as FileSystem[],
        serializedFS: JSON.stringify(Directory.root.serialize()),
    }),

    getters: {
        currPath(state): string {
            return state.currentNode.isRoot() ? '/' : Path.getPath(state.currentNode as FileSystem);
        },
    },
    actions: {

        serialize(): string {
            return JSON.stringify(Directory.root.serialize());
        },

        async updateFileSystem(): Promise<boolean> {
            try {
                await updateFS(
                    useAccountStore().accountAddress,
                    this.serialize(),
                );
                this.children = getChildren(this.currentNode as FileSystem);
                return true;
            } catch (e) {
                notifyNeg(e);
                return false;
            }
        },

        async createTable(
            dir: Directory|null,
            name: string,
            schema: string,
            blockAddress: string,
            size: number,
            contractAddress: string,
        ): Promise<void> {
            TableFile.make(dir, name, schema, blockAddress, size, contractAddress);
            await this.updateFileSystem();
        },

        async removeNodeAt(index: number): Promise<boolean> {
            const dir = this.currentNode.asDir();
            if (dir) dir.removeChildAt(index);
            return this.updateFileSystem();
        },

        async createFile(
            type: {
                isDB?: boolean|null,
                isDir?: boolean|null,
            },
            name: string,
            dir: Directory,
            source: string,
        ): Promise<void> {
            if (type.isDB) {
                makeTable(
                    name,
                    source,
                    undefined,
                    undefined,
                    dir,
                );
            } else if (type.isDir) {
                makeDir(name, dir);
            }

            await this.updateFileSystem();
        },

        deserialize(root: string): void {
            this.reset();
            this.root = deserializeFileSystem(root);
        },

        setCurrNode(node: FileSystem, callback?: () => void): void {
            this.currentNode = node;
            this.children = getChildren(node);
            if (callback) callback();
        },

        openFolder(
            node: unknown,
            index: number,
            callback?: ((child: FileSystem) => void),
        ): FileSystem|null {
            if (index >= 0 && node instanceof FileSystem) {
                const dir = node.asDir();
                if (!dir) return null;
                if (dir.children.length <= index) return null;
                const child = dir.children[index];
                if (callback) callback(child);
                return child;
            }
            return null;
        },
        goBack(callback?: (parent: FileSystem) => void): void {
            if (!this.currentNode) return;
            if (this.currentNode.isRoot()) return;
            const parent = (this.currentNode as FileSystem).parent || Directory.root;
            this.setCurrNode(parent);
            if (callback) callback(parent);
        },
        handleEnterKey(value: string, callback?: (node: FileSystem) => void): void {
            try {
                const node = cdWithBothFileAndDirAsLastChild(value, Directory.root);
                this.setCurrNode(node);
                if (callback) callback(node);
            } catch (e) {
                notifyNeg(e);
            }
        },
        reset(): void {
            this.$reset();
            Directory.root.reset();
        },
    },
});

export default useFSStore;
