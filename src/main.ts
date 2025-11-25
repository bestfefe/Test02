import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router, { registerDynamicRoutes } from './router'
import { createPinia } from 'pinia'

// 引入 Arco Design
import ArcoVue from '@arco-design/web-vue'
import ArcoVueIcon from '@arco-design/web-vue/es/icon'
import '@arco-design/web-vue/dist/arco.css'

async function bootstrap() {
    const app = createApp(App)

    // 注册 Arco 和路由
    app.use(ArcoVue)
    app.use(ArcoVueIcon)
    // 注册Pinia
    app.use(createPinia())
    // 动态注册菜单路由（确保 Layout 子页面可访问）
    app.use(router)
    await registerDynamicRoutes()

    // 动态路由加载后再执行导航
    router.isReady().then(() => {
        app.mount('#app')
    })
}

bootstrap()
