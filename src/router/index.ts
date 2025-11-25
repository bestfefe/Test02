import { createRouter, createWebHistory } from 'vue-router'
import Layout from '@/views/Layout.vue'
import { getMenuList } from '@/api/menu'
import { buildTree } from '@/utils/buildTree'
import { useTagsViewStore } from '@/store/tagsView.ts'

// 基础静态路由
const routes = [
    {
        path: '/',
        name: 'Login',
        component: () => import('@/views/Login.vue'),
    },
    {
        path: '/Layout',
        name: 'Layout',
        component: Layout,
        children: [
            {
                path: '/home',
                name: 'Home',
                component: () => import('@/views/Home.vue'),
            },
            {
                path: '/Test',
                name: 'test',
                component: () => import('@/views/Test.vue'),
            },
        ],
    },
]

const router = createRouter({
    history: createWebHistory(),
    routes,
})

// 动态路由注册状态
let isDynamicRoutesRegistered = false

// 动态注册菜单路由
export async function registerDynamicRoutes() {
    if (isDynamicRoutesRegistered) {
        return // 防止重复注册
    }

    try {
        const res = await getMenuList()
        if (!res?.success || !Array.isArray(res.data)) {
            console.warn('菜单接口返回异常：', res)
            return
        }

        const treeData = buildTree(res.data)

        treeData.forEach((parent: any) => {
            const folderName = parent.url
            parent.children?.forEach((child: any) => {
                const path = child.url.startsWith('/') ? child.url : `/${child.url}`
                // 使用相对路径，避免构建问题
                const filePath = `../views/a-menu/${folderName}/${child.url}.vue`

                try {
                    router.addRoute('Layout', {
                        path,
                        name: child.name || child.title,
                        component: () => import(/* @vite-ignore */ filePath),
                        meta: {
                            title: child.title,
                            requiresAuth: true // 添加认证标记
                        }
                    })
                    console.log(`已注册路由:URL ${path} => 项目中路径为 ${filePath}`)
                } catch (err) {
                    console.warn(`页面未找到: ${filePath}`, err)
                    // 可以添加一个默认的错误页面
                }
            })
        })

        isDynamicRoutesRegistered = true
        console.log('动态路由注册完成')
    } catch (e) {
        console.error('菜单加载失败', e)
        // 可以跳转到错误页面
    }
}

// 添加全局路由守卫
router.beforeEach(async (to, _from, next) => {
    // 如果访问的是登录页，直接放行
    if (to.name === 'Login') {
        next()
        return
    }

    // 如果动态路由还没有注册，先注册动态路由
    if (!isDynamicRoutesRegistered) {
        try {
            await registerDynamicRoutes()
            // 动态路由注册完成后，重新导航到目标路由
            next(to.fullPath)
            return
        } catch (error) {
            console.error('动态路由注册失败:', error)
            next('/login') // 注册失败跳转到登录页
            return
        }
    }

    // 正常放行
    next()
})
router.afterEach((to) => {
    if (to.path === '/' || to.name === 'Login') return

    const tagsStore = useTagsViewStore()
    tagsStore.addView(to)
})

export default router
