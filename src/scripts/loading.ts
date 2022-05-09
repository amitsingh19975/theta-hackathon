import { ref } from 'vue';

class Loading {
    static isLoading = ref(false);

    static get isLoaded() : boolean { return this.isLoading.value === true; }

    static complete() : void {
        this.isLoading.value = true;
    }

    static reset() : void {
        this.isLoading.value = false;
    }
}

export default Loading;
