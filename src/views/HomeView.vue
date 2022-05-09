<template>
    <div class="q-pa-md fit">
        <AppFileManager/>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import Loading from '@/scripts/loading';
import AppFileManager from '@/components/AppFileManager.vue';

export default defineComponent({
    name: 'HomeVue',
    setup() {
        return {
        };
    },
    mounted() {
        Loading.complete();
        // const callback = () => Loading.complete();
        // this.notifyWhenLogged(callback);
    },
    components: {
        AppFileManager,
    },
});
</script>

<style lang="scss" scoped>

</style>
