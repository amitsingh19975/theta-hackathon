import {
    createRouter, createWebHistory, RouteRecordRaw,
} from 'vue-router';
import Loading from '@/scripts/loading';
import { isLogged } from '@/scripts/user';
import HomeView from '@/views/HomeView.vue';

const routes: Array<RouteRecordRaw> = [
    {
        path: '/',
        name: 'LandingView',
        component: () => import('@/views/LandingView.vue'),
        meta: { shouldForceRedirectIfLoggedIn: true },
    },
    {
        path: '/home',
        name: 'HomeView',
        component: HomeView,
        meta: { isLogginReq: true },
    },
    {
        path: '/login',
        name: 'LoginView',
        component: () => import('@/views/LoginView.vue'),
        meta: { shouldForceRedirectIfLoggedIn: true },
    },
    {
        path: '/signup',
        name: 'SignupView',
        component: () => import('@/views/SignupView.vue'),
        meta: { shouldForceRedirectIfLoggedIn: true },
    },
    {
        path: '/market',
        name: 'MarketView',
        component: () => import('@/views/MarketView.vue'),
        meta: { isLogginReq: true },
    },
    // {
    //     path: '/profile',
    //     name: 'LandingView',
    //     component: () => import('@/views/LandingView.vue'),
    // },
];

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes,
});

router.beforeEach((to, from, next) => {
    Loading.reset();
    const { meta } = to;
    if (isLogged()) {
        if (meta.shouldForceRedirectIfLoggedIn) {
            next({ path: '/home' });
        } else {
            next();
        }
    } else if (meta.isLogginReq) {
        next({ path: '/' });
    } else {
        next();
    }
});

export default router;
