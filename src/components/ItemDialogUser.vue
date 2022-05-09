<template>
    <div class="fit">
        <div class="text-h3">Owner</div>
        <q-separator dark inset/>

        <div class="user" v-if="!loading">
            <q-avatar
                style="border-radius: 4%; padding:0"
                rounded
                color="accent"
                text-color="white"
                :icon="farUserCircle"
                size="15rem"
                v-if="!showShouldAvatar"
            />
            <q-avatar
                style="border-radius: 4%"
                rounded
                size="15rem"
                v-else
            >
                <img :src="user.avatar">
            </q-avatar>
            <div class="user-info fit">
                <AppInput
                    :disable="true"
                    name="Address"
                    placeholder="Address"
                    type="text"
                    :value="user.address"
                />
                <AppInput
                    :disable="true"
                    name="Name"
                    placeholder="Name"
                    type="text"
                    :value="user.firstname + ' ' + user.lastname"
                />
                <AppInput
                    :disable="true"
                    name="Email"
                    placeholder="Email"
                    type="text"
                    :value="user.email"
                />
            </div>
        </div>
        <q-card dark class="fit user" v-if="loading">
            <q-skeleton dark width="15rem" height="10rem" type="QAvatar" />
            <q-skeleton dark width="100%" height="100%" square />
        </q-card>
    </div>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue';
import { farUserCircle } from '@quasar/extras/fontawesome-v5';
import AppInput from './AppInput.vue';

export default defineComponent({
    name: 'ItemDialogUser',
    props: {
        loading: {
            type: Boolean,
            required: true,
        },
        user: {
            type: Object,
            required: true,
        },
    },
    components: {
        AppInput,
    },
    setup(props) {
        const showShouldAvatar = computed(() => {
            if (typeof props.user.avatar !== 'string') return false;
            return props.user.avatar.trim().length !== 0;
        });
        return {
            farUserCircle,
            showShouldAvatar,
        };
    },
});
</script>

<style lang="scss" scoped>

div {
    padding: 1rem;
}
.user{
    display: flex;
    align-items: center;
    gap: 1rem;
    &-info{
        padding: 1rem 2rem 0 2rem;
        display: flex;
        flex-direction: column;
        & > * {
            margin-bottom: 1rem;
        }
    }
}

</style>
