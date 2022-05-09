<template>
    <div class="fit database-container" v-if="info">
        <div class="info-panel">
            <div class="info-block">
                <div class="info-block-header">
                    <div class="text-h3">Info </div>
                    <div class="info-block-btns">
                        <q-btn color="accent" @click="isShareInProcess = true">
                            <q-icon name="share"/>
                            <span>Share</span>
                        </q-btn>
                        <q-btn
                            color="blue"
                            @click="syncAddress"
                            :loading="syncing"
                            :disable="!needsSyncing"
                        >
                            <q-icon name="sync"/>
                            <span>Sync</span>
                            <q-tooltip>
                                Loads the Address from the contract
                            </q-tooltip>
                        </q-btn>
                        <q-btn color="red"
                            @click="updateTableAddress"
                            :loading="updatingAddress"
                            :disable="!synced"
                        >
                            <q-icon name="edit_note"/>
                            <span>Overwrite</span>
                            <q-tooltip v-if="synced">
                                Replaces the local "Edgestore" address from the contract
                            </q-tooltip>
                            <q-tooltip v-else>
                                Please sync first
                            </q-tooltip>
                        </q-btn>
                    </div>
                </div>
                <q-separator dark/>
                <div class="info-block-body fit">
                    <AppInput
                        :disable="true"
                        name="name"
                        placeholder="Name"
                        type="text"
                        v-model="info.name"
                    />
                    <AppInput
                        :disable="true"
                        name="size"
                        placeholder="Size"
                        type="text"
                        v-model="normalizeSize"
                    />
                    <div class="btns">
                        <AppBtn
                            :icon="fasCog"
                            color="blue"
                            label="Execute GraphQL Cmd"
                            @click="execCmd"
                            :loading="execLoading"
                        >
                            <template v-slot:append>
                                <q-tooltip>
                                    Executes the GraphQL commands
                                </q-tooltip>
                            </template>
                        </AppBtn>
                        <div class="save-cancel-btn">
                            <AppBtn
                                icon="update"
                                color="red"
                                :label="updateContractLabel"
                                size="1.2rem"
                                :disable="!canUpdateContract"
                                @click="updateContract"
                                :loading="isUpdatingContract"
                            />
                            <AppBtn
                                icon="save_as"
                                color="green"
                                label="Save"
                                :disable="!needToSave"
                                :loading="saving"
                                @click="save"
                            />
                        </div>
                    </div>
                </div>
            </div>
            <ItemDialogSchema
                class="schema-block"
                :code="schema"
                lang="graphql"
                title="Schema"
            />
        </div>
        <div class="fit editor-panel">
            <div class="editor-panel-header">
                <div class="text-h3">Code Editor</div>
                <q-separator dark/>
            </div>
            <GraphQLEditor
                class="editor-block"
                @value="code=$event"
                :default="defGQLSchema"
            />
        </div>
        <div class="table-panel">
            <div>
                <AppBtn
                    icon="table_chart"
                    color="primary"
                    label="Tabular View"
                    border
                    @click="isTabularView = true"
                    :disable="isTableViewDisabled"
                />
                <AppBtn
                    icon="article"
                    color="primary"
                    label="Json View"
                    border
                    @click="isTabularView = false"
                />
                <div>
                    <input
                        type="file"
                        style="display: none;"
                        ref="filePickerEl"
                        @change="setFilePicker"
                        accept=".csv"
                    >
                    <AppBtn
                        icon="upload_file"
                        color="primary"
                        label="Upload CSV"
                        border
                        @click="$refs.filePickerEl.click()"
                        :loading="filePickerLoading"
                    />
                </div>
            </div>
            <q-separator dark inset style="margin-bottom: 1rem"/>
            <div class="scroll table-panel-body">
                <ItemDialogTable
                    :loading="tableLoading"
                    :columns="cols || []"
                    :rows="rows"
                    v-if="isTabularView"
                />
                <ItemDialogSchema
                    v-else
                    :code="rows"
                    lang="json"
                />
            </div>
        </div>
    </div>
    <div class="error-mess fit" v-else>
        <div class="text-h3 text-center">{{err(fileNode)}}</div>
    </div>
    <ShareDialog
        :toggle="isShareInProcess"
        :donotCloseOnSubmit="true"
        :loading="isSubmittingToMarket"
        @submit="shareToMarketPlace"
        @closed="isShareInProcess=false"
        :defaultPrices="defaultPrices"
        :disableRInput="disableRInput"
        :disableRWInput="disableRWInput"
    />
</template>

<script lang="ts">
/* eslint-disable import/no-extraneous-dependencies */

import {
    computed, defineComponent, reactive, ref,
} from 'vue';
import {
    findTFUELUnit,
    fromFileToTypeString, notifyInfo, notifyNeg, TFUELUnitType,
} from '@/scripts/utils';
import { FileSystem, File } from 'theta_database/src/fs';
import TableFile, { TableMetadataType } from 'theta_database/src/fsInternal/tableFile';
import { fasCog } from '@quasar/extras/fontawesome-v5';
import { QTableProps } from 'quasar';
import { graphql } from 'graphql';
import csv from 'csvtojson';
import useMarketStore, { IPrice } from '@/store/market';
import useAccountStore from '@/store/account';
import { storeToRefs } from 'pinia';
import useFSStore from '@/store/fs';
import router from '@/router';
import ItemDialogSchema from './ItemDialogSchema.vue';
import AppInput from './AppInput.vue';
import GraphQLEditor from './GraphQLEditor.vue';
import ItemDialogTable from './ItemDialogTable.vue';
import ShareDialog from './ShareDialog.vue';
import AppBtn from './AppBtn.vue';

const defGQLSchema = (() => (
    `
# mutation{
#     addRows(input: [
#         {
#             name: "Amit Singh",
#             phone: 123456789,
#             city: "Lucknow",
#             dob: "01/03/1998"
#         }
#     ])
# }
    `
))();

type ColumnsType = QTableProps['columns'];

const makeCol = (field: string, sortable = false) => ({
    name: field,
    required: true,
    label: field,
    align: 'center',
    field,
    sortable,
});

const makeCols = (fields: string[], sortable: boolean[], indexName = '#') => {
    const res = [makeCol(indexName, true)];
    for (let i = 0; i < fields.length; i += 1) {
        if (fields[i] !== indexName) {
            res.push(makeCol(fields[i], sortable[i]));
        }
    }
    return res as NonNullable<ColumnsType>;
};

const getIfSortableArray = (obj: Record<string, unknown>) => {
    const res = [] as boolean[];
    const values = Object.values(obj);
    for (let i = 0; i < values.length; i += 1) {
        const el = values[i];
        const type = typeof el;
        if (type === 'object' || type === 'function' || type === 'undefined' || type === 'symbol') {
            res.push(false);
        } else {
            res.push(true);
        }
    }
    return res;
};

const KB: [number, string] = [1024, 'KB'];
const MB: [number, string] = [KB[0] * KB[0], 'MB'];
const GB: [number, string] = [MB[0] * KB[0], 'GB'];
const TB: [number, string] = [GB[0] * KB[0], 'TB'];

export default defineComponent({
    name: 'AppDatabase',
    props: {
        fileNode: {
            type: Object,
            required: true,
            validator: (node: FileSystem) => node.asFile()?.asTable() !== undefined,
        },
    },
    components: {
        ItemDialogSchema,
        AppInput,
        GraphQLEditor,
        ItemDialogTable,
        ShareDialog,
        AppBtn,
    },
    setup(props) {
        const node = (obj: unknown) => {
            if (obj instanceof File) return obj as File;
            return null;
        };

        const tableNode = (obj: unknown) => {
            const temp = node(obj);
            const table = temp?.asTable();
            if (!table) {
                router.push({ name: 'HomeView' });
                throw new Error('unknown file, please use "TableFile"!');
            } else return table;
        };

        const tableFile = ref<TableFile>(tableNode(props.fileNode));

        const info = ref<TableMetadataType>(tableFile.value.getInfo());
        info.value.name = tableFile.value.name;

        const err = (obj: unknown) => {
            if (obj instanceof FileSystem) {
                const file = obj.asFile();
                if (!file) {
                    return 'Expecting database file ["TableFile"], but found "Directory" type!';
                }
                if (!file.isTable()) {
                    return `Expecting database file ["TableFile"], but found "${fromFileToTypeString(file)}" type!`;
                }
            }
            return 'Expecting database file ["TableFile"], but found unknown type!';
        };

        const tableLoading = ref(true);
        const rows = ref<Record<string, unknown>[]>([]);
        const cols = computed(() => {
            const len = rows.value.length;
            if (len === 0) return [];
            const keys = Object.keys(rows.value[0]);
            const sortable = getIfSortableArray(rows.value[0]);
            return makeCols(keys, sortable);
        });
        const isShareInProcess = ref(false);
        const isSubmittingToMarket = ref(false);

        const resolver = tableFile.value.makeGraphQLResolver();
        const schema = computed(() => info.value.source);
        const parsedSchema = tableFile.value.makeGraphQLSchema();
        const execLoading = ref(false);
        const fileSize = ref(0);
        const normalizeSize = computed(() => {
            const size = fileSize.value;
            const div = (sz: number, unit: number) => Math.floor(sz / unit);
            const frac = (sz: number, unit: number) => (sz % unit ? `.${(sz % unit)}` : '');
            const fn = (sz: number, unit: [number, string]) => `${div(sz, unit[0])}${frac(sz, unit[0])} ${unit[1]}`;
            if (div(size, TB[0]) !== 0) return fn(size, TB);
            if (div(size, GB[0]) !== 0) return fn(size, GB);
            if (div(size, MB[0]) !== 0) return fn(size, MB);
            if (div(size, KB[0]) !== 0) return fn(size, KB);
            return `${size} B`;
        });

        const defaultPrices = reactive({
            readPrice: '0',
            rwPrice: '0',
        });

        const disableRInput = ref(false);
        const disableRWInput = ref(false);

        const checkPricesIfAvailable = async () => {
            if (!tableFile.value.isShared()) return;
            try {
                const errOr = await tableFile.value.contract.getPrices(useAccountStore().address);
                if (errOr instanceof Error) throw errOr;
                if (errOr.length === 0) throw new Error('contract is corrupt');
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                const [_, rp, rwp] = errOr;
                defaultPrices.readPrice = rp;
                defaultPrices.rwPrice = rwp;
                disableRInput.value = true;
                disableRWInput.value = true;
            } catch (e) {
                notifyNeg(e);
            }
        };

        const { accountAddress } = storeToRefs(useAccountStore());

        return {
            node,
            err,
            tableFile,
            info,
            schema,
            fasCog,
            code: ref(''),
            reloadCnt: ref(0),
            renderComponent: ref(false),
            cols,
            tableLoading,
            rows,
            isShareInProcess,
            isSubmittingToMarket,
            isTabularView: ref(true),
            resolver,
            parsedSchema,
            execLoading,
            fileSize,
            normalizeSize,
            filePickerLoading: ref(false),
            needToSave: ref(false),
            canUpdateContract: ref(false),
            saving: ref(false),
            updateContractLabel: ref('Update Contract'),
            disableRInput,
            disableRWInput,
            defaultPrices,
            checkPricesIfAvailable,
            isUpdatingContract: ref(false),
            syncing: ref(false),
            updatingAddress: ref(false),
            synced: ref(false),
            needsSyncing: ref(false),
            accountAddress,
            isTableViewDisabled: ref(false),
            defGQLSchema,
        };
    },
    methods: {

        async updateBalance(): Promise<void> {
            useAccountStore().updateBalance();
        },

        async updateFileSystem(): Promise<boolean> {
            return useFSStore().updateFileSystem();
        },

        async checkIfNeedsSyncing(): Promise<boolean|Error> {
            try {
                const crt = this.tableFile.contract;
                const addressOnContractOr = await crt.getBlockAddress(this.accountAddress);
                if (addressOnContractOr instanceof Error) throw addressOnContractOr;
                return addressOnContractOr !== this.tableFile.blockAddress;
            } catch (e) {
                return e as Error;
            }
        },

        async updateContract(): Promise<void> {
            this.isUpdatingContract = true;
            try {
                const crt = this.tableFile.contract;
                const addressOnContractOr = await crt.getBlockAddress(this.accountAddress);
                if (addressOnContractOr instanceof Error) throw addressOnContractOr;
                if (addressOnContractOr === this.tableFile.blockAddress) {
                    throw new Error('The contract and database has same edgestore address; hence, no update is needed');
                }
                await crt.updateBlockAddress(this.accountAddress, this.tableFile.blockAddress);
                await this.updateBalance();
                notifyInfo('Contract has been updated successfully');
            } catch (e) {
                notifyNeg(e);
            }

            this.isUpdatingContract = false;
        },

        _isBasicType(el: unknown): boolean {
            if (el === null) return true;
            switch (typeof el) {
            case 'string': case 'boolean': case 'number': case 'undefined': return true;
            default: return false;
            }
        },

        _checkIfBasicType(row: Record<string, unknown>): boolean {
            const values = Object.values(row);

            for (let i = 0; i < values.length; i += 1) {
                const el = values[i];
                if (!this._isBasicType(el)) return false;
            }
            return true;
        },

        transformRows(rows: Record<string, unknown>[]): void {
            const reset = () => {
                this.isTabularView = true;
                this.isTableViewDisabled = false;
            };

            if (rows.length === 0) {
                reset();
                return;
            }

            if (!this._checkIfBasicType(rows[0])) {
                this.isTabularView = false;
                this.isTableViewDisabled = true;
            } else {
                reset();
            }
            this.rows = rows.map((el, idx) => ({
                '#': idx,
                ...el,
            }));
        },

        parseTypes(data: Record<string, unknown>[]): Record<string, unknown>[] {
            const res = [];
            for (let i = 0; i < data.length; i += 1) {
                res.push(this.tableFile.parseTypes(data[i]));
            }
            return res;
        },

        async setFilePicker(e: Event): Promise<void> {
            this.filePickerLoading = true;
            const fileInput = e.target as HTMLInputElement;
            const file = fileInput.files;
            if (file && file.length > 0) {
                const fileReader = new FileReader();
                fileReader.addEventListener('loadend', async (el) => {
                    const cnt = el.target?.result;
                    if (cnt) {
                        try {
                            const res = await csv({
                                flatKeys: true,
                                delimiter: 'auto',
                                checkType: true,
                                trim: true,
                            }).fromString(cnt as string);
                            if (!Array.isArray(res)) throw new Error('unable to parse csv');
                            const temp = this.parseTypes(res);
                            await this.resolver.addRows({ input: temp });
                            this.transformRows(this.tableFile.rows);
                        } catch (err) {
                            notifyNeg((err as Error).message);
                        }
                    }
                    this.filePickerLoading = false;
                });
                fileReader.readAsText(file[0]);
            } else {
                notifyNeg('File not found, or file not provided!');
                this.filePickerLoading = false;
            }
        },

        async checkIfCanUpdateContract(): Promise<void> {
            if (!this.tableFile.isShared()) {
                this.updateContractLabel = 'No Contract Found';
                this.canUpdateContract = false;
                return;
            }
            try {
                const crt = this.tableFile.contract;
                const errOr = await crt.hasReadWritePerm(this.accountAddress);
                if (errOr instanceof Error) throw errOr;
                this.canUpdateContract = errOr;
                if (errOr) this.updateContractLabel = 'Update Contract';
                else this.updateContractLabel = 'Contract [No Write Perm]';
            } catch (e) {
                notifyNeg(e);
            }
        },

        async save(): Promise<void> {
            this.saving = true;
            try {
                await this.resolver.commit();
                await this.updateFileSystem();
                this.needsSyncing = true;
            } catch (e) {
                notifyNeg(e);
            }
            this.saving = false;
        },

        async shareToMarketPlace(payload: Record<string, unknown>): Promise<void> {
            this.isSubmittingToMarket = true;
            const market = useMarketStore();
            const temp = payload as {
                prices: {
                    read: IPrice,
                    readWrite: IPrice
                },
                description: string
            };
            const account = this.accountAddress;
            try {
                const prices = {
                    read: {
                        amount: temp.prices.read.amount,
                        unit: temp.prices.read.unit as TFUELUnitType,
                    },
                    readWrite: {
                        amount: temp.prices.readWrite.amount,
                        unit: temp.prices.readWrite.unit as TFUELUnitType,
                    },
                };

                const isAlreadyShared = this.tableFile.isShared();

                if (!isAlreadyShared) {
                    await this.tableFile.share(account, {
                        read: {
                            amount: prices.read.amount,
                            unit: findTFUELUnit(prices.read.unit),
                        },
                        readWrite: {
                            amount: prices.readWrite.amount,
                            unit: findTFUELUnit(prices.readWrite.unit),
                        },
                    });
                    await this.updateBalance();
                }

                const { contractAddress } = this.tableFile;

                if (contractAddress === null) {
                    throw new Error('unable to deply contract');
                }

                if (!isAlreadyShared) await this.updateFileSystem();

                await this.checkIfCanUpdateContract();

                const info = this.tableFile.getInfo();

                market.addItem({
                    contractAddress,
                    address: account,
                    size: this.tableFile.size,
                    name: this.tableFile.name,
                    schema: info.source,
                    fields: info.fields.map((el) => ({
                        name: el.name,
                        type: el.type,
                        desc: el.description,
                    })),
                    desc: temp.description || '',
                    type: 'database',
                    prices,
                });
            } catch (e) {
                notifyNeg(e);
            }

            this.isSubmittingToMarket = false;
            this.isShareInProcess = false;
        },

        async _checkIfCommitted(val: Promise<boolean>|unknown): Promise<boolean> {
            if (val instanceof Promise) {
                await val;
            }
            if (typeof val === 'boolean' && val === true) {
                this.needsSyncing = true;
                await this.updateFileSystem();
                return true;
            }
            return false;
        },

        async run(code: string): Promise<undefined|Record<string, unknown>> {
            try {
                const res = await graphql({
                    schema: this.parsedSchema,
                    source: code,
                    rootValue: this.resolver,
                });
                if (res.errors) {
                    res.errors.forEach((el) => notifyNeg(el.message));
                    return undefined;
                }
                return res.data || {};
            } catch (e) {
                notifyNeg(e);
                return undefined;
            }
        },

        async execCmd(): Promise<void> {
            this.execLoading = true;
            if (this.code.trim().length === 0) {
                this.transformRows(this.tableFile.rows);
            } else {
                const res = await this.run(this.code);
                if (typeof res !== 'undefined') {
                    const values = Object.values(res);
                    let hasObj = true;
                    if (!await this._checkIfCommitted(res.commit)) {
                        for (let i = 0; i < values.length; i += 1) {
                            const el = values[i];
                            if (typeof el !== 'undefined' && typeof el === 'object') {
                                if (Array.isArray(el)) {
                                    this.transformRows(el as Record<string, unknown>[]);
                                } else {
                                    this.transformRows([el] as Record<string, unknown>[]);
                                }
                                hasObj = false;
                                break;
                            }
                        }
                    }

                    if (hasObj) {
                        this.transformRows(this.tableFile.rows);
                    }
                    this.fileSize = this.tableFile.approxSize;
                }
            }

            this.execLoading = false;
        },

        async syncAddress(): Promise<boolean> {
            this.syncing = true;
            this.tableLoading = true;
            const reset = () => {
                this.tableLoading = false;
                this.syncing = false;
                this.synced = true;
            };
            try {
                await this.tableFile.updateAddressFromContract(this.accountAddress);
                await this._initHelper();
                notifyInfo('Synced successfully');
                reset();
                return true;
            } catch (e) {
                notifyNeg(e);
                reset();
            }
            return false;
        },

        async updateTableAddress(): Promise<void> {
            this.updatingAddress = true;
            this.tableLoading = true;
            if (await this.syncAddress() && await this.updateFileSystem()) {
                notifyInfo('Updated the file successfully');
            } else {
                notifyNeg('Unable to update table');
            }
            this.synced = true;
            this.needsSyncing = false;
            this.tableLoading = false;
            this.updatingAddress = false;
        },

        async _initHelper(): Promise<void> {
            await this.tableFile.init();
            this.fileSize = this.tableFile.approxSize;
            this.transformRows(this.tableFile.rows);
        },

        async init(): Promise<void> {
            try {
                this.tableFile.resetBlockAddress();
                this._initHelper();
                if (this.tableFile.isShared()) {
                    await this.checkIfCanUpdateContract();
                    await this.checkPricesIfAvailable();
                    const errOr = await this.checkIfNeedsSyncing();
                    if (errOr instanceof Error) throw errOr;
                    this.needsSyncing = errOr;
                }
            } catch (e) {
                notifyNeg(e);
            }
        },
    },

    async mounted() {
        this.tableLoading = true;

        await this.init();

        this.tableFile.setCommittedCallback(() => { this.needToSave = false; });

        this.tableFile.setCallbackAfter(async ({ funcName, type }) => {
            if (type === 'Mutation' && funcName !== 'commit') {
                this.needToSave = true;
            }
            switch (funcName) {
            case 'addRow': {
                notifyInfo('Row added successfully');
                break;
            }
            case 'addRows': {
                notifyInfo('Rows added successfully');
                break;
            }
            case 'commit': {
                notifyInfo('Committed the data on the edge store successfully');
                break;
            }
            case 'loadChunk': {
                notifyInfo('loaded the chunk successfully');
                break;
            }
            default:
            }
        });

        this.tableLoading = false;
    },
    updated() {
        this.fileSize = this.tableFile.approxSize;
    },
    watch: {
    },
});

</script>

<style lang="scss" scoped>

.database-container {
    // border: 1px solid white;
    display: grid;
    grid-template-columns: 1fr 1fr 2fr;
    gap: 1rem;
    // overflow: scroll;

    & .info-panel {
        min-width: 40rem;
        display: grid;
        grid-template-rows: 0.5fr 0.5fr;
        gap: 1rem;

        & > * {
            overflow: scroll;
            min-height: 36rem;
            background-color: $secondary;
        }
        & .info-block {
            padding: 1rem;
            border: 1px solid $outline;
            &-header {
                // padding: 1rem;
                display: flex;
                justify-content: space-between;
                align-items: center;

                & > *:last-child {
                    padding: 1rem 2rem 1rem 2rem;
                }
            }

            &-body {
                margin-top: 1rem;
                display: flex;
                flex-direction: column;
                gap: 1rem;
                & .btns {
                    display: flex;
                    flex-direction: column;
                    gap: 2rem;
                    & .save-cancel-btn {
                        display: grid;
                        grid-template-columns: repeat(2, 0.5fr);
                        gap: 1rem;
                    }
                }
            }

        }

        & .schema-block {
            padding: 1rem;
            border: 1px solid $outline;
        }
    }

    & .editor-panel {
        background-color: #1E1E1E;
        border: 1px solid $outline;
        min-width: 60rem;
        display: grid;
        grid-template-rows: 0.1fr 0.9fr;
        &-header {
            padding: 1rem;
            padding-bottom: 1rem;
            & > *:first-child {
                padding-bottom: 1rem;
            }
        }
    }

    & .table-panel {
        border: 1px solid $outline;
        min-width: 60rem;
        // overflow: scroll;

        &-body {
            height: 64rem;
        }

        & > div:first-child {
            display: flex;
            justify-content: space-evenly;
            padding: 1rem 0 1rem 0;
        }
    }
}

.error-mess {
    display: flex;
    justify-content: center;
    align-items: center;
    color: lighten($primary,60%);
}

.info-block-btns {
    display: flex;
    justify-content: space-evenly;
    align-items: center;
    gap: 1rem;
    & > * {
        width: 9rem;
        margin: 0;
        padding: 0;
    }
}

</style>
