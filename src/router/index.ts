import { createRouter, createWebHistory } from 'vue-router';
// 定义路由
const routes = [
    {
        path: '/',
        name: 'Login',
        component: () => import('@/views/Login.vue')
    },
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
    }
];

// 创建路由实例
const router = createRouter({
    history: createWebHistory(),
    routes,
});

export default router;
