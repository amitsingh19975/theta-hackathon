<template>
    <q-layout class="container dummy-tag" view="hHh lpR fFf">
        <q-header elevated class="bg-primary text-white" id="container--header" height-hint="98">
            <q-toolbar>
                <q-toolbar-title v-if="!isUserLoggedIn">
                    <q-avatar>
                        <img src="./assets/images/folder.png" />
                        <a href="https://www.flaticon.com/free-icons/folder" style="display:none" title="folder icons">Folder icons created by Freepik - Flaticon</a>
                    </q-avatar>
                    OneStorage
                </q-toolbar-title>
                <q-toolbar-title v-else>
                    <q-avatar
                        style="border-radius: 4%"
                        rounded
                        v-if="avatar.trim().length !== 0"
                    >
                        <img :src="avatar">
                    </q-avatar>
                    <q-avatar
                        style="border-radius: 4%"
                        rounded
                        text-color="white"
                        :icon="farUserCircle"
                        v-else
                    />
                    {{username}}
                </q-toolbar-title>
                <div class="title-btns-balanace">
                    <div class="tfuel-balance" v-if="isUserLoggedIn">
                        <span>{{balance}}</span>
                        <span>TFUEL</span>
                    </div>
                        <!-- style="margin-right: 1rem;" -->
                    <q-btn
                        color="secondary"
                        v-if="isUserLoggedIn"
                        @click="isLogoutInProcess = true; logout(() => isLogoutInProcess = false)"
                        :loading="isLogoutInProcess"
                    >
                        <q-icon name="logout"/>
                        <div style="margin-left:1rem"> Logout </div>
                    </q-btn>
                    <q-btn
                        color="secondary"
                        @click="connecting = true"
                    >
                        <q-icon
                            name="fiber_manual_record"
                            :color="isConnected ? 'green' : 'red'"
                        />
                        <div style="margin-left:1rem">
                            {{isConnected ? "Connected" : "Disconnected"}}
                        </div>
                    </q-btn>
                </div>
            </q-toolbar>

            <q-tabs align="left" v-if="!isUserLoggedIn">
                <q-route-tab to="/" label="Home" />
                <q-route-tab to="/login" label="Sign In" />
                <q-route-tab to="/signup" label="Sign Up" />
            </q-tabs>
            <q-tabs align="left" v-else>
                <q-route-tab to="/home" label="Home" />
                <q-route-tab to="/market" label="Market" />
                <!-- <q-route-tab to="/profile" label="Profile" /> -->
            </q-tabs>
        </q-header>

        <q-page-container>
            <router-view
                v-show="Loading.isLoaded"
                :key="$route.hash + $route.query + serializedFS"
            />

            <q-inner-loading :dark="true" :showing="!Loading.isLoaded">
                <q-spinner-gears size="50px" color="accent" />
            </q-inner-loading>
            <q-linear-progress indeterminate color="accent" v-show="!Loading.isLoaded" />
        </q-page-container>

        <q-dialog v-model="connecting" persistent>
            <q-card dark style="width: 50rem">
                <q-card-section
                    class="row items-center q-pb-none"
                    style="margin-bottom: 1rem"
                >
                    <div class="text-h4">Connect to Backend Server</div>
                    <q-space />
                    <q-btn icon="close" flat round dense v-close-popup />
                </q-card-section>

                <q-separator dark inset/>

                <q-card-section class="conection-body">
                    <div class="conection-url">
                        <AppInput
                            name="edgeStore"
                            type="text"
                            placeholder="Theta EdgeStore URL"
                            v-model="edgeStore"
                        />
                        <ConnectionBtn
                            :state="connectionState.edgeStore"
                            @click="handleConnectReqEdge"
                        />
                    </div>
                    <div class="conection-url">
                        <AppInput
                            name="market"
                            type="text"
                            placeholder="Market"
                            value="Firebase"
                            disable
                        />
                        <ConnectionBtn
                            :state="connectionState.market"
                            @click="handleConnectReqMarket"
                        />
                    </div>
                    <div class="conection-thetanet">
                        <AppInput
                            name="thetanetURL"
                            type="text"
                            placeholder="Thetanet URL"
                            v-model="thetanet.url"
                        />
                        <AppInput
                            name="thetanetID"
                            type="number"
                            placeholder="ChainID"
                            v-model="thetanet.chainID"
                        />
                        <ConnectionBtn
                            :state="connectionState.thetanet"
                            @click="handleConnectReqTheta"
                        />
                    </div>
                </q-card-section>
            </q-card>
        </q-dialog>

    </q-layout>
</template>

<script lang="ts">
import Loading from '@/scripts/loading';
import { defineComponent, reactive, ref } from 'vue';
import { farUserCircle } from '@quasar/extras/fontawesome-v5';
import { mapState, mapActions } from 'pinia';
import { ConnectionState, notifyNeg } from '@/scripts/utils';
import AppInput from './components/AppInput.vue';
import useURLS from './store/urls';
import ConnectionBtn from './components/ConnectionBtn.vue';
import useAccountStore from './store/account';
import useFSStore from './store/fs';

export default defineComponent({
    components: { AppInput, ConnectionBtn },
    name: 'App',

    setup() {
        const isConnected = ref(false);
        const connecting = ref(false);
        const tempBuffer = reactive({
            edgeStore: '',
            thetanet: {
                url: '',
                chainID: 0,
            },
        });

        return {
            Loading,
            farUserCircle,
            isConnected,
            connecting,
            ConnectionState,
            tempBuffer,
            isLogoutInProcess: ref(false),
        };
    },

    computed: {
        ...mapState(useURLS, ['edgeStore', 'thetanet', 'connectionState', 'checkState']),
        ...mapState(useFSStore, ['serializedFS']),
        ...mapState(useAccountStore, ['isUserLoggedIn', 'email', 'avatar', 'username', 'balance']),
    },

    methods: {
        ...mapActions(
            useURLS,
            [
                'setEdgeStoreURL',
                'setEdgeStoreURL',
                'setThetanetChainID',
                'checkEdgeConnection',
                'checkThetanetConnection',
                'checkFirebaseConnection',
            ],
        ),

        ...mapActions(useAccountStore, ['logout', 'fetchUser', 'notifyWhenLogged', 'updateBalance']),

        setIsConnected(): void {
            this.isConnected = this.checkState('edgeStore', 'SUCCESS')
                && this.checkState('market', 'SUCCESS')
                && this.checkState('thetanet', 'SUCCESS');
        },

        async _handleConnectReqEdge(): Promise<Error|unknown> {
            const res = await this.checkEdgeConnection(this.tempBuffer.edgeStore);
            return res;
        },

        async _handleConnectReqTheta(): Promise<Error|unknown> {
            const res = await this.checkThetanetConnection(this.tempBuffer.thetanet);
            return res;
        },

        async _handleConnectReqMarket(): Promise<Error|unknown> {
            const res = await this.checkFirebaseConnection();
            return res;
        },

        async handleConnectReqEdge(): Promise<void> {
            const res = await this._handleConnectReqEdge();
            if (res instanceof Error) notifyNeg(res);
        },

        async handleConnectReqTheta(): Promise<void> {
            const res = await this._handleConnectReqTheta();
            if (res instanceof Error) notifyNeg(res);
        },

        async handleConnectReqMarket(): Promise<void> {
            const res = await this._handleConnectReqMarket();
            if (res instanceof Error) notifyNeg(res);
        },
    },

    created() {
        useURLS().initShareableStorage();
    },

    async mounted() {
        this.setIsConnected();
        this.notifyWhenLogged(() => {
            this.fetchUser()
                .then(() => Loading.complete())
                .catch((e) => {
                    notifyNeg(e);
                });
        });

        this.tempBuffer = {
            edgeStore: this.edgeStore,
            thetanet: { ...this.thetanet },
        };
        if (await this._handleConnectReqEdge() instanceof Error) {
            notifyNeg('Unable to connect to "EdgeStore", please check your connection!');
        }
        if (await this._handleConnectReqTheta() instanceof Error) {
            notifyNeg('Unable to connect to "Thetanet", please check your connection!');
        } else {
            await this.updateBalance();
        }
        if (await this._handleConnectReqMarket() instanceof Error) {
            notifyNeg('Unable to connect to "Firebase", please check your connection!');
        }
    },

    watch: {
        connectionState: {
            deep: true,
            handler(): void {
                this.setIsConnected();
            },
        },

    },
});

</script>

<style lang="scss">
#app {
    width: 100vw;
    height: 100vh;
    & .container {
        background-color: $primary;
    }
}
.conection-body {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    & .conection-url {
        display: grid;
        grid-template-columns: 0.75fr 0.35fr;
        gap: 1rem;
    }

    & .conection-thetanet {
        display: grid;
        grid-template-columns: 0.45fr 0.2fr 0.35fr;
        gap: 1rem;
    }

}

.q-page-container, .q-layout{
    height: 100%;
    width: 100%;
}

.title-btns-balanace {
    display: flex;
    gap: 1rem;
    & .tfuel-balance {
        display: flex;
        background-color: $secondary;
        & > span {
            padding: 0.5rem;
            display: flex;
            text-align: center;
            align-items: center;
        }
        & > span:first-child {
            padding-left: 1rem;
            padding-right: 1rem;
            border: 1px solid $outline;
            font-weight: 600;
        }
        & > span:last-child {
            background-color: $highlight;
        }
    }
}

</style>
