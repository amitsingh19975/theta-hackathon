<template>
    <div class="q-pa-md q-gutter-sm">
        <q-dialog
            v-model="dialog"
            persistent
            maximized
            transition-show="slide-up"
            transition-hide="slide-down"
        >
            <q-card class="bg-primary text-white">
                <q-bar>
                    <q-space />
                    <q-btn dense flat :icon="farWindowClose" v-close-popup>
                        <q-tooltip class="bg-white text-primary">Close</q-tooltip>
                    </q-btn>
                </q-bar>

                <q-card-section>
                    <div class="text-h3" style="padding-left: 1rem">Bio</div>
                </q-card-section>

                <q-separator dark inset style="margin-top:1rem;" />

                <q-card-section class="q-pa-md bio-input">
                    <q-avatar
                        rounded
                        color="accent"
                        text-color="white"
                        :icon="farUserCircle"
                        size="15rem"
                        style="width: 15rem; height: 15rem"
                        v-if="!showAvatarIfExists || user.avatar.trim().length === 0"
                    />
                    <q-avatar
                        rounded
                        size="15rem"
                        style="width: 15rem; height: 15rem"
                        v-else
                    >
                        <img :src="user?.avatar">
                    </q-avatar>
                    <Form
                        :validation-schema="schema"
                        @submit="onSubmit"
                        class="bio-input-form"
                        :initial-values="user"
                    >
                        <Field name="firstname">
                            <AppInput
                                name="firstname"
                                placeholder="First Name"
                                type="text"
                            ></AppInput>
                        </Field>
                        <Field name="lastname">
                            <AppInput
                                name="lastname"
                                placeholder="Last Name"
                                type="text"
                            ></AppInput>
                        </Field>
                        <Field name="avatar">
                            <AppInput
                                name="avatar"
                                placeholder="Avatar Image Url"
                                type="text"
                                v-model="user.avatar"
                                @blur="avatarFieldBlurred"
                            ></AppInput>
                        </Field>
                        <Field name="email">
                            <AppInput
                                name="email"
                                placeholder="E-mail"
                                type="text"
                            ></AppInput>
                        </Field>
                        <q-btn
                            class="q-mt-md submit-btn"
                            outline
                            color="accent"
                            type="submit"
                            size="1.8rem"
                            label="Submit"
                            :loading="isLoading"
                        />
                    </Form>
                </q-card-section>
            </q-card>
        </q-dialog>
    </div>
</template>

<script lang="ts">
import {
    Field, Form, FormActions,
} from 'vee-validate';
import {
    defineComponent, ref,
} from 'vue';
import { farWindowClose, farUserCircle } from '@quasar/extras/fontawesome-v5';
import { IUser, IUserBio } from '@/scripts/user';
import AppInput from '@/components/AppInput.vue';

import useAccountStore from '@/store/account';
import { notifyNeg } from '@/scripts/utils';

const shouldShowDefault = (avatar: string) => {
    if (!avatar) return false;
    if (avatar.trim().length === 0) return false;
    return /\.(jpeg|jpg|gif|png)$/.test(avatar);
};

const schema = {
    firstname: 'required',
    lastname: 'required',
    avatar: '',
    email: 'required|email',
};

export default defineComponent({
    name: 'RegForm',
    components: {
        AppInput,
        Field,
        Form,
    },
    props: {
        toggle: {
            type: Boolean,
            required: true,
        },
        userInfo: {
            type: Object,
            required: true,
        },
    },
    emits: ['update:closed'],
    setup(props) {
        const dialog = ref(props.toggle);
        const user = ref<IUserBio>({
            firstname: '',
            lastname: '',
            avatar: '',
            email: '',
        });

        const isLoading = ref(false);

        return {
            dialog,
            farWindowClose,
            user,
            farUserCircle,
            shouldShowDefault,
            schema,
            isLoading,
            showAvatarIfExists: ref(false),
        };
    },
    methods: {
        avatarFieldBlurred(): void {
            this.showAvatarIfExists = true;
        },
        onSubmit<T extends Record<string, unknown> >(values: T, actions: FormActions<T>): void {
            this.isLoading = true;
            const tempInfo = this.userInfo as Record<string, string>;
            const tempBio = {
                firstname: typeof values.firstname === 'string' ? values.firstname.trim() : '',
                lastname: typeof values.lastname === 'string' ? values.lastname.trim() : '',
                avatar: typeof values.avatar === 'string' ? values.avatar.trim() : '',
                email: typeof values.email === 'string' ? values.email.trim() : '',
            } as IUserBio;

            const temp = {
                address: tempInfo.address.trim(),
                info: tempBio,
            };

            useAccountStore().registerUser(temp as IUser, tempInfo.password, (err) => {
                notifyNeg(err);
            }).then((res) => {
                this.isLoading = false;
                if (!res) return;
                actions.resetForm();
                this.dialog = false;
                this.$router.push({ path: '/home' });
            })
                .catch((err) => notifyNeg(err.message));
        },
    },
    watch: {
        toggle(value: boolean): void {
            this.dialog = value;
        },

        dialog(value: boolean): void {
            if (!value) this.$emit('update:closed');
        },
    },
});

</script>

<style lang="scss" scoped>

$avatar-side: 15rem;

.bio-input{
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    height: 100%;
    margin-top: 3rem;

    &-form {
        position: relative;
        display: flex;
        flex-direction: column;
        justify-content: start;
        width: 50rem;
        height: 100%;
        & > * {
            margin-top: 4rem;
        }
        & .submit-btn{
            width: 100%;
            margin-top: 10rem;
        }
    }
}

</style>
