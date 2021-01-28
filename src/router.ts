import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router);

const router = new Router({
    mode: 'hash',
    base: process.env.BASE_URL,
    routes: [
        {
            path: '/',
            component: () => import('./views/Search.vue')
        },
        {
            path: '/editor',
            component: () => import('./views/Editor.vue')
        },
    ]
});

export default router;
