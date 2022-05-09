<template>
    <q-table
        :title="title"
        :rows="transformRows(rows)"
        :columns="transformCols(columns)"
        row-key="fieldName"
        separator="cell"
        dark
        hide-bottom
        virtual-scroll
        v-model:pagination="pagination"
        :rows-per-page-options="[0]"
        virtual-scroll-sticky-size-start="10"
        class="table scroll"
        @row-click="rowClicked"
        v-if="!loading"
    >
        <template v-slot:header="props">
            <q-tr :props="props">
                <q-th
                    v-for="col in props.cols"
                    :key="col.name"
                    :props="props"
                    class="text-bold text-italic"
                >
                    {{ col.label }}
                </q-th>
            </q-tr>
        </template>
    </q-table>
    <q-skeleton v-if="loading" dark class="fit"/>
</template>

<script lang="ts">
import { IField } from '@/store/market';
import { QTableProps } from 'quasar';
import {
    defineComponent, ref,
} from 'vue';

type ColumnsType = QTableProps['columns'];

export default defineComponent({
    name: 'ItemDialogTable',
    props: {
        rows: {
            type: Array,
            required: true,
        },
        columns: {
            type: Array,
            required: true,
        },
        loading: {
            type: Boolean,
            required: false,
        },
        title: {
            type: String,
            required: false,
        },
    },
    emits: ['click:row'],
    setup() {
        const transformCols = (data: unknown[]) => {
            if (data.length === 0) return undefined;
            return data as ColumnsType;
        };

        const transformRows = (data: unknown[]) => {
            if (data.length === 0) return undefined;
            return data;
        };
        return {
            pagination: ref({
                rowsPerPage: 0,
            }),
            transformCols,
            transformRows,
        };
    },

    methods: {
        rowClicked(event: Event, row: IField): void {
            this.$emit('click:row', row);
        },
    },
});
</script>

<style lang="scss" scoped>

.table {
    font-size: 2rem;
    height: 100%;
    min-width: 50rem;

    .q-table__top, .q-table__bottom, thead tr:first-child th {
        background-color: $secondary;
        font-weight: 700;
    }

    thead tr th {
        position: sticky;
        z-index: 1;
    }

    thead tr:last-child th {
        top: 48px;
    }
    thead tr:first-child th {
        top: 0;
    }
}

</style>
