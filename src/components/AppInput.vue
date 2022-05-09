<template>
    <q-input
        :model-value="inputValue"
        @update:modelValue="update"
        :error-message="errorMessage"
        :error="!!errorMessage"
        dark
        bg-color="primary"
        input-style="text-indent: 1rem;"
        outlined
        standout="bg-primary text-white"
        :placeholder="placeholder"
        :label="placeholder"
        :hint="hint"
        :type="getInputType"
        :disable="disable"
        @keydown.enter.prevent="notifyEnter"
        @blur="$emit('blur', $event)"
  />
</template>

<script lang="ts">

import { useField } from 'vee-validate';
import {
    defineComponent, computed, Ref, toRef,
} from 'vue';

const validateInputType = (value: string) => {
    switch (value) {
    case 'number':
    case 'search':
    case 'textarea':
    case 'time':
    case 'text':
    case 'password':
    case 'email':
    case 'tel':
    case 'file':
    case 'url':
    case 'date': return value;
    default: return undefined;
    }
};

export default defineComponent({
    name: 'AppInput',
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
        disable: {
            type: Boolean,
            required: false,
            default: () => false,
        },
        value: {
            type: [String, Number],
            required: false,
        },
    },

    emits: ['enter', 'input', 'blur'],
    setup(props) {
        const { errorMessage, value } = useField(props.name);
        const getPlaceholder = computed(() => (props.placeholder ? props.placeholder : props.name));
        type RefType = Ref<string|number|undefined|null>;
        const inputValue = value as RefType;
        const userInputValue = toRef(props, 'value') as RefType;
        if (inputValue.value === undefined) inputValue.value = userInputValue.value;
        const getInputType = computed(() => validateInputType(props.type));
        return {
            getPlaceholder,
            errorMessage,
            inputValue,
            getInputType,
            userInputValue,
        };
    },
    methods: {
        notifyEnter(): void {
            this.$emit('enter', this.inputValue);
        },
        update(payload: string|number|null): void {
            this.$emit('input', payload);
            this.inputValue = payload;
        },
    },
    watch: {
        userInputValue(payload: string) : void {
            if (this.inputValue === payload) return;
            this.inputValue = payload;
        },
    },
});
</script>

<style lang="scss" scoped>

// .input-block {
//     margin: 3rem 1rem 1rem 1rem;
//     position: relative;

//     input {
//         margin-top: 0.6rem;
//         width: 100%;
//         height: 4rem;
//         text-indent: 1rem;
//         background-color: $primary;
//         border: 1px solid $outline;
//         caret-color: white;
//         color: $font-color;
//         transition: border 0.1s ease-in-out;

//         &:focus {
//             outline: none;
//             border: 1px solid $highlight;
//         }

//         & + label {
//             position: absolute;
//             top: 1.5rem;
//             left: 1rem;
//             pointer-events: none;
//             transition: all 0.5s ease;
//             opacity: 0;
//         }

//         &:not(:placeholder-shown), &:-webkit-autofill {

//             & + label {
//                 top: -1.8rem;
//                 left: 0;
//                 opacity: 1;
//             }
//         }

//         // &:placeholder-shown > label {
//         //     top: 35%;
//         //     left: 3%;
//         //     opacity: 0;
//         // }
//     }
// }

</style>
