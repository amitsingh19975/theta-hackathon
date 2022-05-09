<template>
    <q-dialog v-model="opened" persistent>
        <q-card dark class="file-type-picker">
            <q-card-section class="header">
                <div class="text-h3">Pick File Type</div>
                <q-separator dark/>
            </q-card-section>

            <q-card-section class="scroll">
                <TableView
                    :items="types"
                    :icon-getter="getIcon"
                    :name-getter="getName"
                    @selected="selectedItem = $event"
                    @item-clicked="selectedItem = $event; notifySelected()"
                />
            </q-card-section>

            <q-card-section>
                <q-separator dark/>
                <q-card-actions align="right" class="file-type-picker-btns">
                    <q-btn flat label="Cancel" color="red" v-close-popup />
                    <q-btn
                        flat
                        label="Select"
                        color="green"
                        @click="notifySelected"
                    />
                </q-card-actions>
            </q-card-section>
        </q-card>
    </q-dialog>
</template>

<script lang="ts">

import { defineComponent, ref } from 'vue';
import { getFileTypes, notifyNeg } from '@/scripts/utils';
import TableView from './TableView.vue';

export default defineComponent({
    name: 'FileTypePicker',
    components: {
        TableView,
    },
    emits: ['selected', 'closed'],
    props: {
        toggle: {
            type: Boolean,
            required: true,
        },
    },
    setup(props) {
        const opened = ref(props.toggle || false);
        const types = getFileTypes();
        const selectedItem = ref(-1);

        const getIcon = <T extends {icon: string}>(item: T) => item.icon;
        const getName = <T extends {name: string}>(item: T) => item.name;

        return {
            opened,
            types,
            selectedItem,
            getIcon,
            getName,
        };
    },
    methods: {
        notifySelected(): void {
            if (this.selectedItem >= 0) {
                this.$emit('selected', this.types[this.selectedItem]);
                this.opened = false;
            } else {
                notifyNeg('Type is not selected, please check');
            }
        },
    },
    watch: {
        toggle(value: boolean): void {
            this.opened = value;
        },
        opened(value: boolean): void {
            if (!value) this.$emit('closed');
        },
    },
});

</script>

<style lang="scss" scoped>

.file-type-picker {
    overflow: hidden;
    height: 50rem;
    width: 50rem;
    display: grid;
    grid-template-columns: 1fr;
    grid-template-rows: 0.1fr 0.9fr 0.1fr;
    padding: 1rem;
    gap: 1rem;

    & .header {
        & > *:last-child {
            margin-top: 2rem;
        }
    }
}

.item-blocks {
    overflow: scroll;
    gap: 2rem;
    display: flex;
    flex-wrap: wrap;
    padding: 1rem;

    & .item {
        padding: 1rem;
        display: flex;
        flex-direction: column;
        align-items: center;
        // margin: 1rem;
        border: 2px solid $outline;
        cursor: pointer;
        transition: background-color 0.2s ease-in-out;
        &:hover {
            background-color: $primary;
        }
    }
    & .selected {
        border: 2px dotted $highlight;
        opacity: 0.8;
        background-color: $primary;
        -webkit-touch-callout: none;
        -webkit-user-select: none;
        -khtml-user-select: none;
        -moz-user-select: none;
        -ms-user-select: none;
        user-select: none;
    }
}

</style>
