<template>
    <div id="container" :style="{width: width, height: height}">
        <slot></slot>
    </div>
</template>

<script lang="ts">

import { defineComponent } from 'vue';

export default defineComponent({
    name: 'AppCard',
    props: {
        height: {
            type: String,
            required: false,
            default: '50rem',
            validator(value: string) : boolean {
                return value.endsWith('rem') || value.endsWith('px') || value.endsWith('em') || value.endsWith('px');
            },
        },
        width: {
            type: String,
            required: false,
            default: '50rem',
            validator(value: string) : boolean {
                return value.endsWith('rem') || value.endsWith('px') || value.endsWith('em') || value.endsWith('px');
            },
        },
    },
});

</script>

<style lang="scss" scoped>

#container {
    background-color: $secondary;
    position: relative;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    padding: 3rem;
}

</style>
