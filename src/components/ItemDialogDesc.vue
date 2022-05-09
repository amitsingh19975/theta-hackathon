<template>
    <q-card dark flat fit bordered class="desc-card scroll">
      <q-card-section class="header">
            <div class="text-h3">{{title}} Description</div>
            <q-btn class="header-btn" @click="emitReset">
                <q-icon left size="1em" :name="fasRedo" />
                <div>Reset</div>
            </q-btn>
      </q-card-section>

      <q-separator dark inset />

      <q-card-section>
        <div
            class="empty-desc"
            v-if="description.trim().length === 0"
        >
            No Description Provided
        </div>
        <div v-else class="text-h4">{{description}}</div>
      </q-card-section>
    </q-card>
</template>

<script lang="ts">
import {
    defineComponent,
} from 'vue';

import { fasRedo } from '@quasar/extras/fontawesome-v5';

export default defineComponent({
    name: 'ItemDialogDesc',
    props: {
        title: {
            type: String,
            requires: true,
        },
        description: {
            type: String,
            required: true,
        },
    },
    emits: ['reset'],
    setup() {
        return {
            fasRedo,
        };
    },
    methods: {
        emitReset(): void {
            this.$emit('reset');
        },
    },
});
</script>

<style lang="scss" scoped>

.desc-card {
    overflow: scroll;
    background-color: $secondary;
    padding: 2rem;

    & > * {
        margin-bottom: 1rem;
    }

    & .header {
        display: flex;
        justify-content: space-between;
        align-items: center;

        &-btn {
            width: 12rem;
            height: 5rem;
            background-color: $highlight;
            & div {
                margin-left: 1rem;
            }
        }
    }
}

.empty-desc {
    text-align: center;
    font-size: 3rem;
    color: darken($color: white, $amount: 25%);
}

</style>
