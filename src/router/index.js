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
                name: 'Home',
                redirect: { name: 'Monthly' },
            },
            {
                path: 'monthly',
                name: 'Monthly',
                component: Monthly,
            },
            {
                path: 'compass',
                name: 'Compass',
                component: Compass,
            },
            {
                path: 'danger',
                name: 'Danger',
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
