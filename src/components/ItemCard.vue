<template>
    <q-card class="item-card" flat bordered dark>
        <q-card-section horizontal style="height: 20rem;">
            <q-card-section class="q-pt-xs text">
                <div class="text-h5 q-mt-sm q-mb-xs">{{name}}</div>
                <div class="text text-caption text-grey .cut-text">
                    {{limitText(desc || 'No description was provided')}}
                </div>
                </q-card-section>

                <q-card-section class="col-5 flex flex-center">
                <img v-if="type === 'database'"
                    class="rounded-borders"
                    src="../assets/images/database.png"
                    style="width: 8rem; heigth: 8rem"
                />
                <a href="https://www.flaticon.com/free-icons/data" v-if="type === 'database'" style="display: none" title="data icons">Data icons created by srip - Flaticon</a>
                <img v-if="type === 'image'"
                    class="rounded-borders"
                    src="../assets/images/picture.png"
                    style="width: 5rem; heigth: 5rem"
                />
                <a href="https://www.flaticon.com/free-icons/photo" v-if="type === 'image'" style="display: none" title="photo icons">Photo icons created by Good Ware - Flaticon</a>
            </q-card-section>
        </q-card-section>
        <q-separator dark inset style="margin-bottom: 1rem;" />
        <q-card-section class="item-card-prices">
            <div class="price-block">
                <span>Read Price</span> <span>{{readPrice}}</span>
            </div>
            <div class="price-block">
                <span>Read-Write Price</span> <span>{{readWritePrice}}</span>
            </div>
        </q-card-section>
    </q-card>
</template>

<script lang="ts">
import { limitText } from '@/scripts/utils';
import { IPrice } from '@/store/market';
import { computed, defineComponent, toRef } from 'vue';

export default defineComponent({
    name: 'ItemCard',
    props: {
        name: {
            type: String,
            required: true,
        },
        type: {
            type: String,
            required: true,
        },
        description: {
            type: String,
            required: false,
        },
        rp: {
            type: Object,
            required: true,
        },
        rwp: {
            type: Object,
            required: true,
        },
    },
    setup(props) {
        const priceHelper = (price: IPrice) => `${price.amount} ${price.unit[0].toUpperCase() + price.unit.substring(1)}`;
        const readWritePrice = computed(() => priceHelper(props.rwp as IPrice));
        const readPrice = computed(() => priceHelper(props.rp as IPrice));
        return {
            desc: toRef(props, 'description'),
            limitText,
            readPrice,
            readWritePrice,
        };
    },
});
</script>

<style lang="scss" scoped>

.item-card {
    overflow: none;
    margin: 0 1rem 1rem 0;
    width: 30rem;
    padding: 1rem;
    cursor: pointer;
    transition: transform 0.2s ease-in-out;

    &:hover {
        border: 1px solid $highlight;
    }

    & .text{
        font-size: 1.5rem;
    }

    & .text-h5{
        font-size: 2rem;
        margin-bottom: 1rem;
    }

    &-prices {
        position: relative;
        width: 100%;
        & .price-block {
            display: flex;
            justify-content: space-between;
        }
    }
}

</style>
