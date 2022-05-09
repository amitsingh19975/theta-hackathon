<template>
    <div class="market-container">
        <div
            class="q-pa-md"
            v-for="(v,k) in items" :key="k"
        >
            <ItemCard
                :name="v.name"
                :type="v.type"
                :description="v.desc"
                :rp="v.prices.read"
                :rwp="v.prices.readWrite"
                @click="showDialogForItem(k)"
            />
        </div>
        <ItemDialog
            :toggle="showDialog"
            v-if="itemID >= 0"
            :item="items[itemID]"
            @update:closed="dialogClosed()"
        />
    </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import Loading from '@/scripts/loading';
import useMarketStore from '@/store/market';
import ItemCard from '@/components/ItemCard.vue';
import ItemDialog from '@/components/ItemDialog.vue';
import { mapActions, mapState } from 'pinia';
import useAccountStore from '@/store/account';

export default defineComponent({
    name: 'MarketView',
    components: {
        ItemCard,
        ItemDialog,
    },

    setup() {
        const itemID = ref(-1);
        const showDialog = ref(false);
        const showDialogForItem = (itemSelected: number) => {
            itemID.value = itemSelected;
            showDialog.value = true;
        };

        const dialogClosed = () => {
            showDialog.value = false;
        };

        return {
            itemID,
            showDialog,
            showDialogForItem,
            dialogClosed,
        };
    },

    computed: {
        ...mapState(useMarketStore, ['items']),
    },

    methods: {
        ...mapActions(useMarketStore, ['loadItems']),
        ...mapActions(useAccountStore, ['notifyWhenLogged']),
    },

    mounted() {
        this.loadItems().then(() => Loading.complete());
    },

});
</script>

<style lang="scss" scoped>

.market-container {
    overflow: auto;
    height: 100%;
    width: 100%;
    padding: 1rem;
    display: flex;
    flex-wrap: wrap;

    & div {
        margin: 0 3rem 3rem 3rem;
    }
}

</style>
