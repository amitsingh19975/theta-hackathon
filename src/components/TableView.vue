<template>
    <div class="table-container fit">
        <div v-if="showNewBtn">
            <span :class="{'table-item': true, 'new-btn': true, selected: selectedItem === NEWID}"
                @dblclick="emitClicked(NEWID)"
                @click="selectedItem = NEWID"
            >
                <q-icon size="8rem" :name="fileIcons.new"></q-icon>
            </span>
        </div>
        <div
            v-for="(v,i) in items"
            :key="i"
        >
            <span :class="{'table-item': true, selected: selectedItem === i}"
                @dblclick="emitClicked(i)"
                @click="selectedItem = i"
            >
                <q-icon size="8rem" :name="iconGetter(v)"></q-icon>
                <div class="text-h5">{{normalizeName(nameGetter(v))}}</div>
                <q-tooltip>{{nameGetter(v)}}</q-tooltip>
                <q-menu
                    dark
                    fit
                    context-menu
                    touch-position
                    auto-close
                >
                    <q-list style="min-width: 200px;" class="context-list">
                        <q-item @click="emitRemove(i);" clickable>
                            <q-item-section class="drop-menu-item">
                                <q-icon
                                    class="drop-menu-item-icon icon-delete"
                                    size="3rem"
                                    name="delete"></q-icon>
                                <div>Remove</div>
                            </q-item-section>
                        </q-item>
                    </q-list>
                </q-menu>
            </span>
        </div>
    </div>
</template>

<script lang="ts">

import { fileIcons, limitText } from '@/scripts/utils';
import { defineComponent, ref } from 'vue';

const NONE = -2;
const NEWID = -1;

export default defineComponent({
    name: 'TableView',
    components: {
    },
    emits: ['selected', 'newSelected', 'itemClicked', 'remove'],
    props: {
        items: {
            type: Array,
            required: true,
        },
        iconGetter: {
            type: Function,
            required: true,
        },
        nameGetter: {
            type: Function,
            required: true,
        },
        showNewBtn: {
            type: Boolean,
            required: false,
        },
    },
    setup() {
        const selectedItem = ref(NONE);

        const checkForClass = (el: HTMLElement|null, className: string) => {
            if (!el) return false;
            if (typeof el.classList === 'undefined') return false;
            return el.classList.contains(className);
        };

        const childrenContainerClicked = (ev: Event) => {
            let el = ev.target as (HTMLElement|null);
            while (el) {
                if (checkForClass(el, 'dummy-tag')) break;
                if (checkForClass(el, 'table-item')) return;
                el = el.parentElement as (HTMLElement | null);
            }
            selectedItem.value = NONE;
        };

        document.addEventListener('click', childrenContainerClicked);
        const normalizeName = (name: string) => limitText(name, 15);

        return {
            selectedItem,
            fileIcons,
            NONE,
            NEWID,
            normalizeName,
        };
    },
    methods: {
        emitClicked(idx: number): void {
            this.$emit('itemClicked', idx);
        },
        emitRemove(idx: number): void {
            this.$emit('remove', idx);
        },
    },
    watch: {
        selectedItem(idx: number): void {
            if (idx >= 0) this.$emit('selected', idx);
            else if (idx === NEWID) this.$emit('newSelected');
        },
    },
});

</script>

<style lang="scss" scoped>

.table-container{
    overflow: scroll;
    display: flex;
    gap: 1rem;
    flex-wrap: wrap;
    & .table-item {
        background-color: $secondary;
        padding: 0.5rem 2rem 1rem 2rem;
        border: 2px solid $outline;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        cursor: pointer;
        transition: background-color 0.2s ease-in-out;
        &:hover {
            background-color: $primary;
        }

    }
    & .new-btn {
        border: 2px dotted $outline;
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

.drop-menu-item {
    display: grid;
    grid-template-columns: 0.2fr 0.8fr;
    gap:1rem;
    border: 1px solid $outline;
    background-color: $secondary;
    &-icon {
        background-color: $primary;
        border-right: 1px solid $outline;
        height: 100%;
        width: 100%;
    }
    & .icon-delete {
        color: lighten(red, 20%);
    }

    & > * {
        display: flex;
        flex-direction: column;
        justify-content: center;
    }
}

.context-list {
    & > * {
        padding: 0;
    }
}

</style>
