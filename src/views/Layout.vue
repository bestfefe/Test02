<template>
  <div class="layout-container">
    <!-- 左侧菜单 -->
    <div class="menu-wrapper">
      <!--Logo-->
      <div class="logo-area">
        <img src="@/assets/logo.png" alt="Logo" class="logo-img"/>
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
            >
              {{ child.title }}
            </a-menu-item>
          </a-sub-menu>

          <!-- 没有子菜单 -->
          <a-menu-item
              v-else
              :key="menu.id + '-item'"
          >
            {{ menu.title }}
          </a-menu-item>
        </template>
      </a-menu>
    </div>

    <!-- 右侧主内容 -->
    <div class="content-wrapper">
      <router-view />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { getMenuList } from "@/api/menu.ts";
import { buildTree } from "@/utils/buildTree.ts";

const menuData = ref<any[]>([]);

onMounted(async () => {
  const res = await getMenuList();
  if (res.success) {
    menuData.value = buildTree(res.data);
    console.log("菜单数据：", menuData.value);
  } else {
    console.warn("获取菜单失败：", res.message);
  }
});
</script>

<style scoped>
.logo-area{
  background-color: #232324;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 48px;
}
.logo-img{
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
  width: 100%!important;
  border: none;
  box-shadow: none;
  flex: 1;
}

.content-wrapper {
  flex: 1;
  background-color: #fff;
  overflow-y: auto;
  padding: 16px;
}
</style>
