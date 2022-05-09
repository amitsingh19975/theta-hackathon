<template>
    <q-card class="sign-in-card bg-secondary">
        <q-card-section>
            <div class="text-h2 text-center">Sign In</div>
        </q-card-section>

        <q-separator dark inset style="margin-top:2rem" />

        <q-card-section class="sign-in-card-body">
            <Form
                :validation-schema="schema"
                @submit="onSubmit"
                class="sign-in-card-body-form"
            >
                <Field name="address">
                    <AppDropInput
                        name="address"
                        placeholder="Address"
                        type="text"
                        :addresses="accounts"
                        v-model="initialAddress"
                        hint="Address must be a hex string."
                    />
                </Field>
                <Field name="password">
                    <AppInput
                        name="password"
                        placeholder="Password"
                        type="password"
                        hint="Password must at least six character long."
                    />
                </Field>

                <q-btn
                    class="q-mt-md submit-btn"
                    outline
                    color="accent"
                    type="submit"
                    size="1.8rem"
                    label="Login"
                    :loading="isloginInProcess"
                />
            </Form>
        </q-card-section>
    </q-card>
</template>

<script lang="ts">
import {
    Field, Form, FormActions,
} from 'vee-validate';
import AppInput from '@/components/AppInput.vue';
import AppDropInput from '@/components/AppDropInput.vue';
import { defineComponent, ref } from 'vue';
import Loading from '@/scripts/loading';
import { getAccounts, notifyNeg } from '@/scripts/utils';
import { mapActions } from 'pinia';
import useAccountStore from '@/store/account';
import useFSStore from '@/store/fs';

const schema = {
    address: 'required|address',
    password: 'required|min:6',
};

export default defineComponent({
    name: 'LoginView',
    components: {
        Field,
        Form,
        AppInput,
        AppDropInput,
    },
    setup() {
        const initialAddress = ref('');
        const accounts = ref<string[]>([]);
        return {
            schema,
            initialAddress,
            accounts,
            isloginInProcess: ref(false),
        };
    },
    methods: {
        ...mapActions(useAccountStore, ['login']),

        onSubmit<T extends Record<string, unknown> >(values: T, actions: FormActions<T>) {
            this.isloginInProcess = true;
            if (typeof values.address !== 'string') {
                notifyNeg('"address" not found in the form data');
                return;
            }
            if (typeof values.password !== 'string') {
                notifyNeg('"password" not found in the form data');
                return;
            }
            this.login(values.address as string, values.password as string)
                .then((res) => {
                    if (res) {
                        actions.resetForm();
                        this.$router.push({ name: 'HomeView' });
                    }
                    this.isloginInProcess = false;
                }).catch((err) => {
                    notifyNeg(err);
                    this.isloginInProcess = false;
                });
        },
    },

    async mounted() {
        useFSStore().reset();
        this.accounts = await getAccounts();
        if (this.accounts.length > 0) {
            const [f] = this.accounts;
            this.initialAddress = f;
        }
        Loading.complete();
    },
});

</script>

<style lang="scss" scoped>

h1 {
    font-weight: 400;
    text-align: center;
    font-size: 3rem;
}

.sign-in-card{
    width: 50rem;
    height: 50rem;
    padding: 2rem;
    position: relative;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    &-body{
        height: 100%;
        &-form {
            height: 100%;
            display: flex;
            flex-direction: column;
            padding-top: 4rem;
            & > * {
                margin-top: 3rem;
            }
            & .submit-btn{
                margin-top: 8rem;
            }
        }
    }
}

</style>
