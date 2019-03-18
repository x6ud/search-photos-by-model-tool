import Vue from 'vue'
import Router from 'vue-router'

import Search from './views/Search.vue'

Vue.use(Router);

export default new Router({
    mode: 'hash',
    base: process.env.BASE_URL,
    routes: [
        {
            path: '/',
            name: 'search',
            component: Search
        },
        {
            path: '/editor',
            name: 'editor',
            component: () => import('./views/Editor.vue')
        }
    ]
});