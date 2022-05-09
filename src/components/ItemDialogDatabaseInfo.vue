<template>
    <div class="fit">
        <div class="text-h3">{{getType(item.type)}}</div>
        <q-separator dark inset/>
        <div class="data">
            <AppInput
                :disable="true"
                name="Contract Address"
                placeholder="Contract Address"
                type="text"
                :value="item.contractAddress"
            />
            <AppInput
                :disable="true"
                name="Name"
                placeholder="Name"
                type="text"
                :value="item.name"
            />
            <span class="fit row data-buy justify-evenly" v-if="!isOwner">
                <AppInput
                    :disable="true"
                    name="Read Price"
                    placeholder="Read Price"
                    type="text"
                    :value="readPrice"
                />
                <AppInput
                    :disable="true"
                    name="Read-Write Price"
                    placeholder="Read-Write Price"
                    type="text"
                    :value="readWritePrice"
                />
            </span>
            <span class="fit balance" v-else>
                <AppInput
                    :disable="true"
                    name="contractBalance"
                    placeholder="Contract Balance"
                    type="text"
                    :value="contractBalance"
                />
                <q-select
                    outlined
                    dark
                    color="secondary"
                    v-model="balanceUnit"
                    :options="units"
                    label="Unit" />
            </span>
            <div class="buy-btn">
                <AppBtn
                    color="accent"
                    :loading="isWithdrawing"
                    @click="withdraw"
                    :icon="fasMoneyBill"
                    label="Withdraw"
                    size="1.5rem"
                    v-if="isOwner"
                    :disable="contractBalance.trim() === '0'"
                />
                <AppBtn
                    color="accent"
                    :loading="isCheckingAccess"
                    :disable="state === BtnNONE"
                    @click="buyBox = true"
                    :icon="fasShoppingCart"
                    :label="btnText()"
                    size="1.5rem"
                    v-else
                />
                <AppBtn
                    color="blue"
                    :loading="isSavingToFS"
                    :disable="isOwner ? false : (state === BtnBUY)"
                    icon="save_as"
                    label="Save To Filesystem"
                    size="1.5rem"
                    @click="openFilePicker = true"
                />
            </div>
            <q-dialog v-model="buyBox" persistent v-if="state < 2">
                <q-card dark>
                    <q-card-section class="row items-center q-gutter-sm">
                        <q-radio
                            dark
                            color="blue"
                            v-model="access"
                            checked-icon="task_alt"
                            unchecked-icon="panorama_fish_eye"
                            val="r"
                            :label="`Read Access( ${readPrice} )`"
                            v-if="state === BtnBUY"
                        />
                        <q-radio
                            dark
                            color="blue"
                            v-model="access"
                            checked-icon="task_alt"
                            unchecked-icon="panorama_fish_eye"
                            val="rw"
                            :label="`Read-Write Access( ${readWritePrice} )`"
                        />
                    </q-card-section>

                    <q-card-actions align="right">
                        <q-btn dark flat label="Cancel" color="red" v-close-popup />
                        <q-btn
                            dark
                            flat
                            label="Buy"
                            color="accent"
                            @click="buyFile"
                            :loading="isBuying"
                        />
                    </q-card-actions>
                </q-card>
            </q-dialog>
            <AppFilePicker
                :toggle="openFilePicker"
                @selected="saveToFS"
                :defaultFilename="item.name"
            />
        </div>
    </div>
</template>

<script lang="ts">
import { computed, defineComponent, ref } from 'vue';
import { fasShoppingCart, fasMoneyBill } from '@quasar/extras/fontawesome-v5';
import ShareableStorage from 'theta_database/src/contract';
import {
    conv,
    findTFUELUnit,
    getUnits, notifyInfo, notifyNeg, notifyPos, TFUELUnitType,
} from '@/scripts/utils';
import useAccountStore from '@/store/account';
import { mapActions, mapState } from 'pinia';
import { fromWei, toWei } from 'web3-utils';
import { FileSystem } from 'theta_database/src/fs';
import useFSStore from '@/store/fs';
import AppInput from './AppInput.vue';
import AppBtn from './AppBtn.vue';
import AppFilePicker from './AppFilePicker.vue';

const BtnNONE = 2;
const BtnUPGRADE = 1;
const BtnBUY = 0;

const NO_PERM = 0;
const READ_PERM = 1;
const RW_PERM = 2;

const getType = (type: unknown) => {
    if (typeof type !== 'string') return 'Unknown';
    switch (type) {
    case 'database': return 'Database';
    case 'img': return 'Image';
    default: return 'Unknown Format';
    }
};

export default defineComponent({
    name: 'ItemDialogDatabaseInfo',
    props: {
        item: {
            type: Object,
            required: true,
        },
    },
    components: {
        AppInput,
        AppBtn,
        AppFilePicker,
    },
    setup(props) {
        const rp = ref<string>(props.item.prices.read.amount);
        const rwp = ref<string>(props.item.prices.readWrite.amount);
        const rpUnit = ref<string>(props.item.prices.read.unit);
        const rwpUnit = ref<string>(props.item.prices.readWrite.unit);
        const priceHelper = (price: string, unit: string) => `${price} ${unit[0].toUpperCase() + unit.substring(1)}`;
        const readWritePrice = computed(() => priceHelper(rwp.value, rwpUnit.value));
        const readPrice = computed(() => priceHelper(rp.value, rpUnit.value));
        const isCheckingAccess = ref(true);
        const state = ref<number>(BtnBUY);
        const btnText = () => {
            if (state.value === BtnNONE) return 'Already have full Access';
            if (state.value === BtnBUY) return 'Buy Access';
            return 'Upgrade Access';
        };
        return {
            getType,
            fasShoppingCart,
            fasMoneyBill,
            readWritePrice,
            readPrice,
            isCheckingAccess,
            state,
            btnText,
            rp,
            rwp,
            units: getUnits(),
            buyBox: ref(false),
            access: ref('r'),
            isBuying: ref(false),
            rpUnit,
            rwpUnit,
            openFilePicker: ref(false),
            isSavingToFS: ref(false),
            BtnNONE,
            BtnUPGRADE,
            BtnBUY,
            contract: new ShareableStorage(props.item.contractAddress),
            isOwner: ref(false),
            isWithdrawing: ref(false),
            contractBalance: ref('123'),
            balanceUnit: ref('wei'),
        };
    },
    async mounted() {
        this.isOwner = await this.checkIfOwner();
        if (this.isOwner) {
            this.contractBalance = await this.getContractBalance();
        } else {
            await this.checkPricesOnContract();
        }
    },

    watch: {
        item: {
            deep: true,
            handler(val): void {
                this.contract = new ShareableStorage(val.item.contractAddress);
            },
        },
        balanceUnit(unit: string, old: string): void {
            const temp = conv(this.contractBalance, old as TFUELUnitType, unit as TFUELUnitType);
            this.contractBalance = temp;
        },
    },

    computed: {
        ...mapState(useAccountStore, ['accountAddress']),
    },

    methods: {
        ...mapActions(useAccountStore, ['updateBalance']),

        async getContractBalance(): Promise<string> {
            try {
                const res = await this.contract.contractBalance(this.accountAddress);
                if (res instanceof Error) throw res;
                return res;
            } catch (e) {
                notifyNeg(e);
                return '0';
            }
        },

        async withdraw(): Promise<void> {
            this.isWithdrawing = true;
            try {
                const res = await this.contract.withdraw(this.accountAddress);
                await this.updateBalance();
                this.contractBalance = '0';
                if (res instanceof Error) throw res;
                notifyPos('Withdrawal successful');
            } catch (e) {
                notifyNeg(e);
            }
            this.isWithdrawing = false;
        },

        async checkPricesOnContract(): Promise<void> {
            this.isCheckingAccess = true;

            try {
                this.contract = new ShareableStorage(this.item.contractAddress);
                const errOr = await this.contract.myAccessLevel(this.accountAddress);
                this.rp = await this.amountToPayForLevel(this.contract, 1, this.rpUnit);
                this.rwp = await this.amountToPayForLevel(this.contract, 2, this.rwpUnit);

                if (errOr instanceof Error) throw errOr;
                this.state = errOr;
            } catch (e) {
                notifyNeg(e);
            }
            this.isCheckingAccess = false;
        },

        async saveToFS(node: FileSystem, filename: string): Promise<void> {
            if (node === null) {
                this.openFilePicker = false;
                return;
            }
            const dir = node.asDir();
            if (!dir) {
                notifyNeg('Please select a directory.');
                return;
            }
            this.isSavingToFS = true;
            try {
                const name = filename || this.item.name;
                const schema = this.item.schema as string;
                const contractAddress = this.item.contractAddress as string;
                const size = this.item.size as number;
                const blockAddress = await this.getBlockAddress();
                await useFSStore()
                    .createTable(dir, name, schema, blockAddress, size, contractAddress);
                this.openFilePicker = false;
            } catch (e) {
                notifyNeg(e);
            }
            this.isSavingToFS = false;
        },

        async getBlockAddress(): Promise<string> {
            const errOr = await this.contract.getBlockAddress(this.accountAddress);
            if (errOr instanceof Error) throw errOr;
            return errOr;
        },

        _getPrice(): [number, string] {
            switch (this.access) {
            case 'r': return [READ_PERM, toWei(this.rp, findTFUELUnit(this.rpUnit as TFUELUnitType))];
            case 'rw': return [RW_PERM, toWei(this.rwp, findTFUELUnit(this.rwpUnit as TFUELUnitType))];
            default:
            }
            return [NO_PERM, '0'];
        },

        async checkIfOwner(): Promise<boolean> {
            try {
                const errOr = await this.contract.isOwner(this.accountAddress);
                if (errOr instanceof Error) throw errOr;
                return errOr;
            } catch (e) {
                notifyNeg(e);
                return (this.accountAddress === this.item.address);
            }
        },

        async buyFile(): Promise<void> {
            this.isBuying = true;
            const [lvl, price] = this._getPrice();
            if (lvl > NO_PERM) {
                const errOr = await this.contract.buy(this.accountAddress, lvl, price);
                await this.updateBalance();
                if (errOr instanceof Error) {
                    notifyNeg(errOr);
                } else {
                    notifyInfo(`Bought the database ['${this.item.name}'] successfully!`);
                    await this.checkPricesOnContract();
                }
            }
            this.buyBox = false;
            this.isBuying = false;
        },

        async amountToPayForLevel(
            contract: ShareableStorage,
            level: number,
            unit: string,
        ): Promise<string> {
            try {
                const val = await contract.amountToPayForLevel(this.accountAddress, level);
                if (val instanceof Error) throw val;
                return fromWei(val, findTFUELUnit(unit as TFUELUnitType));
            } catch {
                if (level === 1) return this.rp;
                if (level === 2) return this.rwp;
                return '0';
            }
        },
    },
});
</script>

<style lang="scss" scoped>

div {
    padding: 1rem;
}
.data{
    display: flex;
    flex-direction: column;
    gap: 1rem;

    &-buy{
        & > *:nth-child(2) {
            margin: 0 1rem 0 1rem;
        }
    }
}

.buy-btn {
    width: 100%;
    display: flex;
    gap: 1rem;
    justify-content: space-evenly;
}

.radio-btn > .q-icon {
    color: $highlight;
}

.balance {
    display: flex;
    gap: 1rem;
    & > *:first-child {
        flex-basis: 80%;
    }
    & > *:last-child {
        flex-basis: 20%;
    }
}

</style>
