import { createRouter, createWebHistory } from 'vue-router';
import Layout from'@/views/Layout.vue'
// 定义路由
const routes = [
    {
        path: '/',
        name: 'Login',
        component: () => import('@/views/Login.vue')
    },
    //带Layout
    {
        path:'/',
        component:Layout,
        children:[
            {
                path: '/about',
                name: 'About',
                component: () => import('@/views/About.vue')
            },
            {
                path: '/home',
                name: 'Home',
                component: () => import('@/views/Home.vue')
            },
            {
                path: '/test',
                name: 'Test',
                component: () => import('@/views/Test.vue')
            },
            {
                path: '/layout',
                name: 'Layout',
                component: () => import('@/views/Layout.vue')
            }
        ]
    }

];

// 创建路由实例
const router = createRouter({
    history: createWebHistory(),
    routes,
});

export default router;
