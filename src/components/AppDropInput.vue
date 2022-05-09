<template>
    <span class="drop-down-input">
        <AppInput
            :value="inputValue"
            @input="updateInput"
            :placeholder="placeholder"
            :hint="hint"
            :type="type"
            :name="name"
        >
        </AppInput>
        <div class="drop-down-btn">
            <q-btn dense flat :icon="downArrow" style="width: 100%; height: 100%">
                <q-menu
                    dark
                    max-height="30rem"
                    max-width="100%"
                    style="border: 1px solid gray"
                >
                    <q-list
                        v-for="(v,k) in addresses"
                        :key="k"
                    >
                        <q-item
                            clickable
                            v-close-popup
                            @click="setInput(v,k)"
                            :class="{ selected: selectedID === k }"
                        >
                            <q-item-section>{{v}}</q-item-section>
                        </q-item>
                    </q-list>
                </q-menu>
                <q-badge
                    color="red"
                    floating
                    style="padding: 0.4rem"
                >
                    {{addresses.length}}
                </q-badge>
                <q-tooltip>
                    List all the addresses it can find.
                </q-tooltip>
            </q-btn>
        </div>
    </span>
</template>

<script lang="ts">
import {
    defineComponent, ref,
} from 'vue';
import { fasArrowCircleDown } from '@quasar/extras/fontawesome-v5';
import AppInput from './AppInput.vue';

export default defineComponent({
    name: 'AppDropInput',
    props: {
        name: {
            type: String,
            required: true,
        },
        type: {
            type: String,
            required: true,
        },
        placeholder: {
            type: String,
            required: false,
        },
        hint: {
            type: String,
            required: false,
        },
        addresses: {
            type: Array,
            required: false,
        },
        value: {
            type: [String, Number],
            required: false,
        },
    },
    components: {
        AppInput,
    },
    emits: ['input'],
    setup(props) {
        const downArrow = fasArrowCircleDown;
        const inputValue = ref(props.value);
        return {
            downArrow,
            inputValue,
            selectedID: ref(0),
        };
    },
    methods: {
        toString(value: unknown): string {
            return typeof value === 'string' ? value : String(value);
        },
        setInput(value: unknown, id: number) : void {
            this.inputValue = this.toString(value);
            this.selectedID = id;
        },
        updateInput(val: string): void {
            this.$emit('input', val);
            this.inputValue = val;
        },
    },
});
</script>

<style lang="scss" scoped>

input {
    &:focus {
        outline: none;
        border: 1px solid $highlight !important;
    }
}

.drop-down-input {
    padding: 0;
    display: flex;
    gap: 1rem;
    & > *:first-child {
        flex-basis: 90%;
        border: 1px solid $outline;
    }
    & .drop-down-btn {
        flex-basis: 15%;
        display: flex;
        justify-content: center;
        border: 1px solid $outline;
        & > * {
            background-color: $primary;
        }
    }

}

.q-list {
    background-color: $primary;
    & > * {
        padding: 0 1rem 0 1rem
    }

    & .selected {
        border: none;
        background-color: $highlight;
    }
}

</style>
