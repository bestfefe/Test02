<template>
  <div class="layout-container">
    <!-- 左侧菜单 -->
    <div class="menu-wrapper">
      <!-- Logo -->
      <div class="logo-area">
        <img src="@/assets/logo.png" alt="Logo" class="logo-img" />
      </div>

      <a-menu
          mode="pop"
          theme="dark"
          :default-open-keys="menuData.length ? [menuData[0].id + '-submenu'] : []"
          accordion
          breakpoint="xxl"
          show-collapse-button
      >
        <template v-for="menu in menuData" :key="menu.id">
          <!-- 有子菜单 -->
          <a-sub-menu
              v-if="menu.children?.length"
              :key="menu.id + '-submenu'"
          >
            <template #title>
              {{ menu.title }}
            </template>
            <a-menu-item
                v-for="child in menu.children"
                :key="child.id + '-item'"
                @click="go(child.url)"
            >
              {{ child.title }}
            </a-menu-item>
          </a-sub-menu>

          <!-- 没有子菜单 -->
          <a-menu-item
              v-else
              :key="menu.id + '-item'"
              @click="go(menu.url)"
          >
            {{ menu.title }}
          </a-menu-item>
        </template>
      </a-menu>
    </div>

    <!-- 右侧主内容 -->
    <div class="content-wrapper">

      <!-- 多标签栏（Tabs）-->
      <a-tabs
          type="card"
          :active-key="activePath"
          @change="handleTabChange"
          class="tabs-bar"
          hide-content
      >
        <a-tab-pane
            v-for="tab in tagsStore.visitedViews"
            :key="tab.path"
        >
          <!-- 使用自定义标题模板 -->
          <template #title>
            <div class="custom-tab-title">
              <span class="tab-text">{{ tab.title }}</span>
              <!-- 根据 closable 字段显示关闭按钮 -->
              <a-button
                  v-if="tab.closable !== false"
                  type="text"
                  size="mini"
                  class="tab-close-btn"
                  @click.stop="handleTabClose(tab.path)"
              >
                <!-- 使用关闭图标 -->
                <IconClose />
              </a-button>
            </div>
          </template>
        </a-tab-pane>
      </a-tabs>

      <!-- 当前路由显示区域 -->
      <router-view />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from "vue";
import { getMenuList } from "@/api/menu";
import { buildTree } from "@/utils/buildTree";
import { useRouter, useRoute } from "vue-router";
import { useTagsViewStore } from "@/store/tagsView";
import { IconClose } from '@arco-design/web-vue/es/icon';

// Router
const router = useRouter();
const route = useRoute();

// 菜单数据
const menuData = ref<any[]>([]);

// 标签页 Store
const tagsStore = useTagsViewStore();

// 当前激活路由 path
const activePath = computed(() => route.path);

// 监听路由变化，自动添加标签页
watch(
    () => route.path,
    (newPath) => {
      if (newPath && newPath !== '/' && newPath !== '/login') {
        tagsStore.addView(route);
      }
    },
    { immediate: true }
);

/** 点击左侧菜单跳转 */
const go = (url: string) => {
  if (!url) return;

  const path = url.startsWith("/") ? url : `/${url}`;
  router.push(path);
};

/** Tab 切换 */
const handleTabChange = (path: string) => {
  router.push(path);
};

/** Tab 关闭 */
const handleTabClose = (path: string) => {
  // 防止关闭固定标签页
  const tab = tagsStore.visitedViews.find(view => view.path === path);
  if (tab && tab.closable === false) {
    return;
  }

  tagsStore.removeView(path);

  // 如果关闭的是当前页，则跳转到其他标签
  if (path === route.path) {
    const remainingViews = tagsStore.visitedViews.filter(view => view.path !== path);
    if (remainingViews.length > 0) {
      // 跳转到最后一个标签
      const last = remainingViews[remainingViews.length - 1];
      if (last) router.push(last.path);
      else router.push('/home');
    } else {
      // 没有其他标签时跳转到首页
      router.push("/home");
    }
  }
};

/** 初始化加载菜单 */
onMounted(async () => {
  const res = await getMenuList();
  if (res.success) {
    menuData.value = buildTree(res.data);
  }

  // 确保首页标签存在
  if (route.path === '/home' && !tagsStore.visitedViews.some(v => v.path === '/home')) {
    tagsStore.addView(route);
  }
});
</script>

<style scoped>
.logo-area {
  background-color: #232324;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 48px;
}
.logo-img {
  height: 32px;
  width: 32px;
}

.layout-container {
  display: flex;
  height: 100vh;
  width: 100vw;
  margin: 0;
  padding: 0;
  position: fixed;
  top: 0;
  left: 0;
}

/* 左侧菜单 */
.menu-wrapper {
  display: flex;
  flex-direction: column;
  background-color: #f9f9f9;
  border-right: 1px solid #e5e5e5;
  width: 8%;
  height: 100%;
  box-sizing: border-box;
}

.menu-wrapper :deep(.arco-menu) {
  height: 100%;
  width: 100% !important;
  border: none;
  box-shadow: none;
  flex: 1;
}

/* 右侧内容区 */
.content-wrapper {
  flex: 1;
  background-color: #fff;
  overflow-y: auto;
  padding: 6px;
}

/* Tabs 样式优化 */
.tabs-bar {
  margin-bottom: 12px;
}

/* 自定义标签页标题样式 */
.custom-tab-title {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 4px;
}

.tab-text {
  flex: 1;
}

.tab-close-btn {
  display: flex;
  align-items: center;
  margin-right: -12px;
  margin-left: 2px;
  width: 16px;
  height: 16px;
  border-radius: 2px;
  color: var(--color-text-2);
  opacity: 0.7;
}

.tab-close-btn:hover {
  background-color: var(--color-fill-3);
  color: var(--color-text-1);
  opacity: 1;
}

.tab-close-btn svg {
  width: 12px !important;
  height: 12px !important;
  flex-shrink: 0 !important;
  display: inline-block;
}

</style>