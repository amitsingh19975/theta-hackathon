<template>
    <q-dialog
      v-model="dialog"
      persistent
      maximized
      transition-show="slide-up"
      transition-hide="slide-down"
    >
        <q-card class="bg-primary text-white">
            <q-bar>
                <q-space />
                <q-btn dense flat :icon="fasWindowClose" v-close-popup style="margin-right:2rem">
                    <q-tooltip class="bg-white text-primary">Close</q-tooltip>
                </q-btn>
            </q-bar>

            <q-card-section class="q-pa-md item fit">
                <div class="item-info-row">
                    <ItemDialogUser :loading="loading" :user="user"/>
                    <ItemDialogSchema :code="item.schema" lang="graphql" title="Schema"/>
                    <ItemDialogDatabaseInfo :item="item"/>
                </div>
                <div class="item-desc-row">
                    <ItemDialogTable
                        :rows="item.fields"
                        :columns="columns || []"
                        @click:row="changeDesc"
                        title="Fields"
                    />
                    <ItemDialogDesc
                        :title="descTitle"
                        :description="desc"
                        @reset="changeToTableDesc"
                    />
                </div>
            </q-card-section>
        </q-card>
    </q-dialog>
</template>

<script lang="ts">
import useMarketStore, { IField, IItem } from '@/store/market';
import { defineComponent, reactive, ref } from 'vue';
import { fasWindowClose, farUserCircle } from '@quasar/extras/fontawesome-v5';
import { IUserBio } from '@/scripts/user';
import { QTableProps } from 'quasar';
import { mapActions } from 'pinia';
import ItemDialogUser from './ItemDialogUser.vue';
import ItemDialogSchema from './ItemDialogSchema.vue';
import ItemDialogDatabaseInfo from './ItemDialogDatabaseInfo.vue';
import ItemDialogTable from './ItemDialogTable.vue';
import ItemDialogDesc from './ItemDialogDesc.vue';

const isItemEmpty = (item: IItem) => {
    if (!item) return false;
    return Object.keys(item).length > 0;
};

type ColumnsType = QTableProps['columns'];

const columns = ref<ColumnsType>([
    {
        name: 'fieldName',
        required: true,
        label: 'Field Name',
        align: 'center',
        field: (row: IField) => row.name,
        format: (val: unknown) => `${val}`,
        sortable: false,
    },
    {
        name: 'type',
        required: true,
        label: 'GraphQL Type',
        align: 'center',
        field: 'type',
        sortable: false,
    },
]);

type UserType = IUserBio & {
    address: string,
};

export default defineComponent({
    name: 'ItemDialog',
    components: {
        ItemDialogUser,
        ItemDialogSchema,
        ItemDialogDatabaseInfo,
        ItemDialogTable,
        ItemDialogDesc,
    },
    props: {
        toggle: {
            type: Boolean,
            required: true,
        },
        item: {
            type: Object,
            required: true,
        },
    },
    emits: ['update:closed'],
    setup(props) {
        const dialog = ref(props.toggle);
        dialog.value = isItemEmpty(props.item as IItem) && dialog.value;
        const shouldShowDefault = ref(true);
        const loading = ref(true);
        const user = reactive<UserType>({
            firstname: 'NONE',
            lastname: 'NONE',
            avatar: '',
            email: 'NONE',
            address: props.item.address,
        });

        const descTitle = ref('Table');
        const desc = ref(props.item.desc);

        const changeToTableDesc = () => {
            descTitle.value = 'Table';
            desc.value = props.item.desc;
        };

        const changeDesc = (row: IField) => {
            descTitle.value = `Field["${row.name}"]`;
            desc.value = row.desc;
        };

        return {
            dialog,
            fasWindowClose,
            farUserCircle,
            shouldShowDefault,
            loading,
            user,
            descTitle,
            desc,
            changeDesc,
            changeToTableDesc,
            columns,
        };
    },
    watch: {
        dialog(val: boolean): void {
            if (!val) this.$emit('update:closed');
        },
        async item(val: IItem): Promise<void> {
            this.dialog = isItemEmpty(val) && this.dialog;
            this.resetUser();
            await this.checkUser();
        },
        toggle(val: boolean): void {
            this.dialog = val;
        },
    },
    methods: {
        ...mapActions(useMarketStore, ['getUser']),
        async checkUser(): Promise<void> {
            const account = this.item.address as string;
            const userInfo = await this.getUser(account);
            this.user = {
                address: this.item.address,
                ...userInfo,
            };
        },
        resetUser(): void {
            this.user = {
                address: this.item.address,
                firstname: 'NONE',
                lastname: 'NONE',
                avatar: '',
                email: 'NONE',
            };
        },
    },
    async mounted(): Promise<void> {
        await this.checkUser();
        // this.user = { address: item.address, ...getUser(item.address) };
        this.loading = false;
    },
});
</script>

<style lang="scss" scoped>

.item {
    // overflow: auto;
    display: grid;
    grid-template-columns: 1fr;
    grid-template-rows: 37rem 45rem;
    gap: 1rem;

    padding: 4rem;
    & div {
        height: 100%;
    }

    &-info-row{
        overflow: auto;
        // height: 40rem;
        display: grid;
        grid-template-columns: 1fr 1fr 1fr;
        gap: 1rem;
        & div {
            border: 1px solid $outline;
            background-color: $secondary;
            min-width: 50rem;
        }
    }

    &-desc-row{
        overflow: scroll;
        display: grid;
        grid-template-columns: 1fr 1fr;
        grid-template-rows: 1fr;
        gap: 1rem;
        height: 30rem;
        & > * {
            border: 1px solid $outline;
        }
    }

    &-table-row{
        height: 40rem;
    }
}

</style>
