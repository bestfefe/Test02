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
          <a-sub-menu v-if="menu.children?.length" :key="menu.id + '-submenu'">
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
          <a-menu-item v-else :key="menu.id + '-item'" @click="go(menu.url)">
            {{ menu.title }}
          </a-menu-item>
        </template>
      </a-menu>
    </div>

    <!-- 右侧主内容（外壳冻结，不随滚动） -->
    <div class="content-wrapper">
      <!-- 多标签栏（Tabs）固定不动 -->
      <a-tabs
          type="card"
          :active-key="activePath"
          @change="handleTabChange"
          class="tabs-bar"
          hide-content
      >
        <a-tab-pane v-for="tab in tagsStore.visitedViews" :key="tab.path">
          <template #title>
            <div class="custom-tab-title">
              <span class="tab-text">{{ tab.title }}</span>

              <a-button
                  v-if="tab.closable !== false"
                  type="text"
                  size="mini"
                  class="tab-close-btn"
                  @click.stop="handleTabClose(tab.path)"
              >
                <IconClose />
              </a-button>
            </div>
          </template>
        </a-tab-pane>
      </a-tabs>

      <!-- ✅ 当前路由显示区域：只让这里滚动 -->
      <div class="page-container">
        <router-view />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue';
import { getMenuList } from '@/api/menu';
import { buildTree } from '@/utils/buildTree';
import { useRouter, useRoute } from 'vue-router';
import { useTagsViewStore } from '@/store/tagsView';
import { IconClose } from '@arco-design/web-vue/es/icon';

const router = useRouter();
const route = useRoute();

const menuData = ref<any[]>([]);
const tagsStore = useTagsViewStore();

const activePath = computed(() => route.path);

watch(
    () => route.path,
    (newPath) => {
      if (newPath && newPath !== '/' && newPath !== '/login') {
        tagsStore.addView(route);
      }
    },
    { immediate: true }
);

const go = (url: string) => {
  if (!url) return;
  const path = url.startsWith('/') ? url : `/${url}`;
  router.push(path);
};

const handleTabChange = (path: string) => {
  router.push(path);
};

const handleTabClose = (path: string) => {
  const tab = tagsStore.visitedViews.find((view) => view.path === path);
  if (tab && tab.closable === false) return;

  tagsStore.removeView(path);

  if (path === route.path) {
    const remainingViews = tagsStore.visitedViews.filter((view) => view.path !== path);
    if (remainingViews.length > 0) {
      const last = remainingViews[remainingViews.length - 1];
      if (last) router.push(last.path);
      else router.push('/home');
    } else {
      router.push('/home');
    }
  }
};

onMounted(async () => {
  const res = await getMenuList();
  if (res.success) {
    menuData.value = buildTree(res.data);
  }

  if (route.path === '/home' && !tagsStore.visitedViews.some((v) => v.path === '/home')) {
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

/* 整体外壳固定 */
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

/* ✅ 右侧内容区：冻结外壳，不滚动 */
.content-wrapper {
  flex: 1;
  background-color: #fff;
  padding: 6px;
  box-sizing: border-box;

  height: 100%;
  display: flex;
  flex-direction: column;

  overflow: hidden; /* ✅ 关键：不让整个右侧滚 */
}

/* Tabs 固定在顶部 */
.tabs-bar {
  flex: 0 0 auto;
  margin-bottom: 12px;
}

/* ✅ 只让页面内容滚动 */
.page-container {
  flex: 1 1 auto;
  overflow: auto; /* ✅ 滚动发生在这里 */
  min-height: 0;  /* ✅ 关键：允许在 flex 容器中滚动 */
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
