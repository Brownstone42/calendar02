import { createRouter, createWebHistory } from 'vue-router'
import Home from '@/views/Home.vue'
import Monthly from '@/views/Monthly.vue'
import Compass from '@/views/Compass.vue'
import Danger from '@/views/Danger.vue'

const routes = [
    {
        path: '/',
        component: Home,
        children: [
            {
                path: '',
                name: 'home',
                redirect: { name: 'monthly' },
            },
            {
                path: 'monthly',
                name: 'monthly',
                component: Monthly,
            },
            {
                path: 'compass',
                name: 'compass',
                component: Compass,
            },
            {
                path: 'danger',
                name: 'danger',
                component: Danger,
            },
        ],
    },
]

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes,
})

export default router
