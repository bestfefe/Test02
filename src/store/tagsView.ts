import { defineStore } from 'pinia'

export const useTagsViewStore = defineStore('tagsView', {
    state: () => ({
        visitedViews: [] as Array<{
            title: string;
            path: string;
            closable?: boolean;  // 添加 closable 字段
        }>
    }),

    actions: {
        addView(view: any) {
            if (this.visitedViews.some(v => v.path === view.path)) return

            // 设置 closable，首页不可关闭，其他页面可关闭
            const closable = view.path !== '/home' && view.path !== '/'

            this.visitedViews.push({
                title: view.meta?.title || view.name,
                path: view.path,
                closable  // 添加 closable 属性
            })
        },

        removeView(path: string) {
            this.visitedViews = this.visitedViews.filter(v => v.path !== path)
        }
    }
})