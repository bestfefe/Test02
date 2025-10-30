<template>
  <div class="navbar-wrapper">
    <!-- 一级菜单 -->
    <a-menu mode="horizontal">
      <a-menu-item
          v-for="item in options"
          :key="item.value"
          :ref="(el:any) => (menuRefs[item.value] = el?.$el || el)"
          class="top-menu"
          @mouseenter="showSubMenu(item)"
          @click="() => handleSelect(item.value)"
      >
        <span>{{ item.label }}</span>
        <icon-down class="arrow-icon" />
      </a-menu-item>
    </a-menu>

    <!-- 二级及以下 -->
    <div
        v-if="activeSubTree"
        class="submenu-wrapper"
        :style="submenuStyle"
        @mouseleave="hideMenus"
    >
      <!-- 二级菜单 -->
      <div class="submenu-vertical">
        <div
            v-for="sub in activeSubTree.children"
            :key="sub.value"
            class="submenu-item"
            @mouseenter="showThirdMenu(sub)"
            @click="() => handleSelect(sub.value)"
        >
          {{ sub.label }}
          <icon-right class="arrow-icon" />
        </div>
      </div>

      <!-- 三级及以下 -->
      <div v-if="activeThirdTree" class="submenu-horizontal">
        <div
            v-for="third in activeThirdTree.children"
            :key="third.value"
            class="third-block"
        >
          <div class="third-title">{{ third.label }}</div>
          <div
              v-if="third.children && third.children.length"
              class="fourth-list"
          >
            <div
                v-for="fourth in third.children"
                :key="fourth.value"
                class="fourth-item"
                @click="() => handleSelect(fourth.value)"
            >
              {{ fourth.label }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, nextTick } from 'vue'
import { IconDown, IconRight } from '@arco-design/web-vue/es/icon'
import type { CSSProperties } from 'vue'

interface Option {
  label: string
  value: string
  children?: Option[]
}

const props = defineProps<{
  value: string
  onChange: (value: string) => void
  options: Option[]
}>()

// 存每个一级菜单的 DOM 引用
const menuRefs: Record<string, HTMLElement | null> = {}
const activeSubTree = ref<Option | null>(null)
const activeThirdTree = ref<Option | null>(null)

// 控制 submenu 的位置
const submenuStyle = reactive<CSSProperties>({
  position: 'absolute',
  left: '0px',
  top: '0px',
})


const showSubMenu = async (item: Option) => {
  activeSubTree.value = item
  activeThirdTree.value = null

  await nextTick() // 等渲染完再取位置信息

  const el = menuRefs[item.value]
  const navbar = document.querySelector('.navbar-wrapper') as HTMLElement

  if (el && el.getBoundingClientRect && navbar) {
    const rect = el.getBoundingClientRect()
    const navbarRect = navbar.getBoundingClientRect()

    // submenu 相对导航栏定位
    submenuStyle.left = `${rect.left - navbarRect.left}px`
    submenuStyle.top = `${rect.bottom - navbarRect.top}px`
  }
}


const showThirdMenu = (sub: Option) => {
  activeThirdTree.value = sub.children ? sub : null
}


const hideMenus = () => {
  activeSubTree.value = null
  activeThirdTree.value = null
}


const handleSelect = (val: string) => {
  props.onChange(val)
}
</script>

<style scoped>
.navbar-wrapper {
  position: relative;
}

.top-menu {
  color: #000;
  font-size: 14px;
  font-weight: 400;
}

.submenu-wrapper {
  position: absolute;
  display: flex;
  background-color: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  z-index: 100;
}

.submenu-vertical {
  color: #000;
  background: #f3f5f7;
  min-width: 134px;
  padding: 4px;
  font-size: 12px;
  border-right: 1px solid #eee;
}

.submenu-item {
  padding: 8px 16px;
  cursor: pointer;
}

.submenu-item:hover {
  color: #165dff;
}
.submenu-horizontal {
  display: flex;
  flex-wrap: wrap;
  align-content: flex-start;
  gap: 4px;
  padding: 4px;
  width: 681px;
  height: 611px;
  background: #fff;
  box-sizing: border-box;
  overflow-y: auto;
}

.third-block {
  padding: 2px;
}

.third-title {
  background-color: #f2f3f9;
  color: #102490;
  padding: 4px 8px;
  margin-bottom: 4px;
}

.fourth-item {
  background-color: #f3f5f7;
  padding: 4px 8px;
  cursor: pointer;
}

.fourth-item:hover {
  color: #165dff;
}

.arrow-icon {
  margin-left: 8px;
  font-size: 12px;
}
</style>
