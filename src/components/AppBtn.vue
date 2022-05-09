<template>
    <q-btn
        :color="color"
        push
        :size="size || '2rem'"
        :padding="padding || '1rem'"
        :class="{ 'btn-border': !!border}"
        :loading="loading"
        :disable="disable"
    >
        <div class="row items-center no-wrap" style="gap: 1rem">
            <q-icon left :name="icon" />
            <div class="text-center" v-if="label">
                {{label}}
            </div>
            <slot name="append"/>
        </div>
    </q-btn>
</template>

<script lang="ts">

import { defineComponent } from 'vue';

export default defineComponent({
    name: 'AppCard',
    props: {
        icon: {
            type: String,
            required: true,
        },
        label: {
            type: String,
            required: false,
        },
        size: {
            type: String,
            required: false,
        },
        padding: {
            type: String,
            required: false,
        },
        color: {
            type: String,
            required: true,
        },
        border: {
            type: Boolean,
            required: false,
        },
        loading: {
            type: Boolean,
            required: false,
        },
        disable: {
            type: Boolean,
            required: false,
        },
    },
});

</script>

<style lang="scss" scoped>

.btn-border {
    border: 1px solid $outline;
}

</style>
