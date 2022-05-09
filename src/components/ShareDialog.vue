<template>
    <q-dialog v-model="confirm" persistent>
      <q-card dark style="padding: 1rem">
        <q-card-section class="row items-center">
          <q-avatar icon="share" color="primary" text-color="white" />
          <span class="q-ml-sm">
              You are currently in the process of listing your table in the market place.
            </span>
        </q-card-section>

        <q-separator dark inset/>

        <Form
            :validation-schema="schema"
            @submit="onSubmit"
            :initial-values="shareForm"
        >
            <q-card-section class="fit" style="margin-top: 1rem">
                    <div class="prices">
                        <Field name="readPrice">
                            <AppInput
                                name="readPrice"
                                type="text"
                                placeholder="Read Price"
                                v-model="shareForm.readPrice"
                                :disable="disableRInput"
                            />
                        </Field>
                        <q-select
                            outlined
                            dark
                            color="secondary"
                            v-model="readPriceUnit"
                            :options="units"
                            label="Unit" />
                    </div>
                    <div class="prices">
                        <Field name="rwPrice">
                            <AppInput
                                name="rwPrice"
                                type="text"
                                placeholder="Read Write Price"
                                v-model="shareForm.rwPrice"
                                :disable="disableRWInput"
                            />
                        </Field>
                        <q-select
                            outlined
                            dark
                            color="primary"
                            v-model="rwPriceUnit"
                            :options="units"
                            label="Unit" />
                    </div>
                    <Field name="description">
                        <AppInput
                            name="description"
                            type="textarea"
                            placeholder="Table Description"
                        />
                    </Field>
            </q-card-section>

            <q-separator dark inset/>

            <q-card-actions align="right">
                <q-btn flat label="Cancel" color="red" @click="confirm = false" />
                <q-btn flat label="Share" color="accent" :loading="loading" type="submit"/>
            </q-card-actions>
        </Form>
      </q-card>
    </q-dialog>
</template>

<script lang="ts">
import { defineComponent, reactive, ref } from 'vue';
import {
    Field, Form, defineRule, FormActions,
} from 'vee-validate';
import { required } from '@vee-validate/rules';
import { conv, getUnits, TFUELUnitType } from '@/scripts/utils';
import AppInput from './AppInput.vue';

defineRule('required', required);
defineRule('numeric', (val: string) => /[0-9]+(\.[0-9]*)?$/.test(val));

export default defineComponent({
    name: 'ShareDialog',
    props: {
        toggle: {
            type: Boolean,
            required: true,
        },
        loading: {
            type: Boolean,
            required: false,
        },
        donotCloseOnSubmit: {
            type: Boolean,
            required: false,
        },
        disableRInput: {
            type: Boolean,
            required: false,
        },
        disableRWInput: {
            type: Boolean,
            required: false,
        },
        defaultPrices: {
            type: Object,
            required: false,
        },
    },
    emits: ['closed', 'submit'],
    setup(props) {
        const confirm = ref(props.toggle);
        const inputVal = ref('');
        const shareForm = reactive({
            readPrice: props.defaultPrices?.readPrice || '0',
            rwPrice: props.defaultPrices?.rwPrice || '0',
        });

        return {
            confirm,
            inputVal,
            rwPriceUnit: ref('wei'),
            readPriceUnit: ref('wei'),
            units: getUnits(),
            schema: reactive({
                readPrice: props.disableRInput ? 'required|numeric' : '',
                rwPrice: props.disableRWInput ? 'required|numeric' : '',
            }),
            shareForm,
        };
    },
    methods: {
        getPrice(val: unknown): string {
            return typeof val === 'number' ? val.toString() : '0';
        },
        onSubmit<T extends Record<string, unknown> >(values: T, actions: FormActions<T>): void {
            const rprice = values.readPrice;
            const rwprice = values.rwPrice;
            const shareData = {
                prices: {
                    read: {
                        amount: rprice,
                        unit: this.readPriceUnit,
                    },
                    readWrite: {
                        amount: rwprice,
                        unit: this.rwPriceUnit,
                    },
                },
                description: values.description || '',
            };
            actions.resetForm();
            this.$emit('submit', shareData);
            if (!this.donotCloseOnSubmit) this.confirm = false;
        },
    },
    watch: {
        toggle(val: boolean): void {
            this.confirm = val;
        },
        confirm(val: boolean): void {
            if (!val) { this.$emit('closed'); }
        },
        readPriceUnit(unit: string, old: string): void {
            const { readPrice } = this.shareForm;
            const temp = conv(readPrice, old as TFUELUnitType, unit as TFUELUnitType);
            this.shareForm.readPrice = temp;
        },
        rwPriceUnit(unit: string, old: string): void {
            const { rwPrice } = this.shareForm;
            const temp = conv(rwPrice, old as TFUELUnitType, unit as TFUELUnitType);
            this.shareForm.rwPrice = temp;
        },
        defaultPrices: {
            deep: true,
            handler(val: {readPrice: string, rwPrice: string}): void {
                this.shareForm.readPrice = val.readPrice;
                this.shareForm.rwPrice = val.rwPrice;
            },
        },
    },
    components: {
        AppInput,
        Field,
        Form,
    },
});

</script>

<style lang="scss" scoped>

.prices {
    display: grid;
    grid-template-columns: 0.6fr 0.4fr;
    margin-bottom: 1rem;
    gap: 1rem;
}

</style>
