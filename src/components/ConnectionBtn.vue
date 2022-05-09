<template>
    <q-btn
        color="secondary"
        :loading="loading"
        :class="{err: ConnectionState.FAILED === state}"
        :disable="disable"
    >
        <q-icon
            left
            size="2em"
            name="fiber_manual_record"
            :color="ConnectionState.SUCCESS === state ? 'green' : 'red'"
        />
        <div
            class="label"
            v-if="shouldShowLabel"
        >
            {{ConnectionState.SUCCESS === state ? "Connected" : "Connect"}}
        </div>
    </q-btn>
</template>

<script lang="ts">

import { computed, defineComponent } from 'vue';
import { ConnectionState } from '@/scripts/utils';

export default defineComponent({
    name: 'ConnectionBtn',
    props: {
        state: {
            type: Number,
            required: false,
            default: ConnectionState.NONE,
            validator: (val: number) => val >= ConnectionState.NONE && val < ConnectionState.SIZE,
        },
        disable: {
            type: Boolean,
            required: false,
        },
    },
    setup(props) {
        const shouldShowLabel = computed(() => props.state === ConnectionState.SUCCESS
                || props.state === ConnectionState.NONE
                || props.state === ConnectionState.FAILED);

        const loading = computed(() => props.state === ConnectionState.CONNECTING);

        return {
            ConnectionState,
            shouldShowLabel,
            loading,
        };
    },
});

</script>

<style lang="scss" scoped>

.label {
    margin-left: 1rem;
}

.err {
    border: 1px solid red;
}

</style>
