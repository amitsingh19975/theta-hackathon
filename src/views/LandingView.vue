<template>
    <div class="q-pa-md fit">
        <q-carousel
            v-model="slide"
            transition-prev="scale"
            transition-next="scale"
            swipeable
            control-color="white"
            animated
            padding
            arrows
            class="bg-primary text-white shadow-1 rounded-borders"
            height="100%"
        >
        <q-carousel-slide name="appName" class="column no-wrap flex-center">
            <div style="font-size: 58px" class="text-italic">OneStorage</div>
            <div class="q-mt-md text-center text-h4">
                Create, buy or share data
            </div>
        </q-carousel-slide>

        </q-carousel>
    </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import Loading from '@/scripts/loading';
import useFSStore from '@/store/fs';

export default defineComponent({
    name: 'LandingView',
    setup() {
        const slide = ref('appName');
        return {
            slide,
        };
    },

    mounted() {
        useFSStore().reset();
        Loading.complete();
    },
});
</script>

<style lang="scss" scoped>

</style>
