<template>
    <q-card class="sign-in-card bg-secondary">
        <q-card-section>
            <div class="text-h2 text-center">Sign Up</div>
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
                        hint="Address must be a hex string."
                        v-model="initialAddress"
                    />
                </Field>
                <Field name="password" ref="passwordRef">
                    <AppInput
                        name="password"
                        placeholder="Password"
                        type="password"
                        hint="Password must at least six character long."
                    />
                </Field>
                <Field name="confirmedPassword">
                    <AppInput
                        name="confirmedPassword"
                        placeholder="Confirm Password"
                        type="password"
                    />
                </Field>

                <q-btn
                    class="q-mt-md submit-btn"
                    outline
                    color="accent"
                    type="submit"
                    size="1.8rem"
                    label="Sign Up"
                />
            </Form>
        </q-card-section>
        <RegForm :toggle="regToggle" @update:closed="regToggle=false" :userInfo="userInfo"/>
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
import RegForm from '@/components/RegForm.vue';
import { getAccounts } from '@/scripts/utils';
import useFSStore from '@/store/fs';

const schema = {
    address: 'required|address',
    password: 'required|min:6',
    confirmedPassword: 'confirmed:@password',
};

export default defineComponent({
    name: 'SignupView',
    components: {
        Field,
        Form,
        AppInput,
        AppDropInput,
        RegForm,
    },
    setup() {
        const accounts = ref<string[]>([]);
        const regToggle = ref(false);
        const initialAddress = ref('');

        const setRegForm = (value: boolean) => {
            regToggle.value = value;
        };

        const userInfo = ref({
            address: '',
            password: '',
        });

        return {
            schema,
            initialAddress,
            regToggle,
            setRegForm,
            userInfo,
            accounts,
        };
    },
    methods: {

        onSubmit<T extends Record<string, unknown> >(values: T, actions: FormActions<T>) {
            actions.resetForm();
            this.userInfo = {
                address: values.address as string,
                password: values.password as string,
            };
            this.setRegForm(true);
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
    // font-size: 3rem;
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
            padding-top: 2rem;
            & > * {
                margin-top: 3rem;
            }
            & .submit-btn{
                margin-top: 4rem;
            }
        }
    }
}

</style>
