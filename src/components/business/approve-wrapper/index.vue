<template>
  <div class="root">
    <!-- ===== Header（固定不滚） ===== -->
    <div class="header">
      <div class="header-inner">
        <a-page-header class="approve-page-header" :show-back="false">
          <template #title>
            {{ title }}
            <slot name="title-extra" />
          </template>

          <template #subtitle>
            <slot name="subtitle" />
          </template>

          <template #extra>
            <div class="extra-bar">
              <slot name="actions">
                <div class="btn-group">
                  <span class="split" aria-hidden="true"></span>

                  <a-button
                      class="btn btn-primary"
                      :loading="confirmLoading"
                      :disabled="confirmDisabled"
                      @click="$emit('confirm')"
                  >
                    确认
                  </a-button>

                  <template v-if="showSave">
                    <span class="split" aria-hidden="true"></span>
                    <a-button class="btn btn-secondary" @click="$emit('save')">
                      暂存
                    </a-button>
                  </template>

                  <template v-if="showBack">
                    <span class="split" aria-hidden="true"></span>
                    <a-button class="btn btn-ghost" @click="$emit('back')">
                      返回
                    </a-button>
                  </template>
                </div>
              </slot>
            </div>
          </template>
        </a-page-header>
      </div>
    </div>

    <!-- ===== Body（不滚，右侧滚） ===== -->
    <div class="body">
      <!-- 左侧：目录放这里（left-panel），本区域可滚动 -->
      <div class="body-left">
        <div class="left-panel">
          <slot name="left-panel" />
        </div>
      </div>

      <!-- 右侧：唯一滚动区域 -->
      <div class="body-right" ref="rightScrollEl">
        <slot />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const rightScrollEl = ref(null);
defineExpose({ rightScrollEl });

defineProps({
  title: { type: String, required: true },
  confirmLoading: { type: Boolean, default: false },
  confirmDisabled: { type: Boolean, default: false },
  showSave: { type: Boolean, default: true },
  showBack: { type: Boolean, default: true },
});

defineEmits(['confirm', 'save', 'back']);
</script>

<style scoped>
/* root 不滚，避免双滚动条 */
.root {
  height: 100%;
  display: flex;
  flex-direction: column;
  min-height: 0;
  overflow: hidden;
}

/* header 固定 */
.header {
  height: 60px;
  padding: 16px;
  box-sizing: border-box;
  background: var(--color-bg-2);
  border-bottom: 1px solid var(--color-border-2);
  display: flex;
  align-items: center;
  position: sticky;
  top: 0;
  z-index: 9;
}

.header-inner {
  height: 28px;
  width: 100%;
  display: flex;
  align-items: center;
  position: relative;
}

/* 清掉 page-header padding */
:deep(.approve-page-header .arco-page-header-wrapper),
:deep(.approve-page-header .arco-page-header) {
  padding: 0 !important;
}

:deep(.approve-page-header),
:deep(.approve-page-header.arco-page-header),
:deep(.approve-page-header .arco-page-header) {
  height: 100%;
  min-height: 28px !important;
  width: 100%;
  background: transparent !important;
  display: flex;
  align-items: center;
}

/* actions */
.extra-bar {
  position: absolute;
  right: 0;
  top: 0;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: flex-end;
}

.btn-group {
  display: inline-flex;
  align-items: center;
  gap: 0;
}

.split {
  width: 25px;
  height: 16.22px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  user-select: none;
}
.split::before {
  content: '';
  width: 1px;
  height: 12px;
  background: #86909c;
  opacity: 0.8;
  border-radius: 1px;
}

:deep(.btn.arco-btn) {
  width: 56px;
  height: 28px;
  padding: 0 !important;
  margin: 0 !important;
  border-radius: 3px !important;
  font-size: 12px !important;
  line-height: 28px !important;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-width: 1px !important;
}

:deep(.btn-primary.arco-btn) {
  background: #335cf1 !important;
  border-color: #335cf1 !important;
  color: #fff !important;
}
:deep(.btn-secondary.arco-btn) {
  background: #f2f3f5 !important;
  border-color: #f2f3f5 !important;
  color: #86909c !important;
}
:deep(.btn-ghost.arco-btn) {
  background: #fff !important;
  color: #335cf1 !important;
}

/* body 不滚 */
.body {
  flex: 1;
  min-height: 0;
  display: flex;
  gap: 12px;
  padding: 12px;
  box-sizing: border-box;
  background: #f2f3f5;
  overflow: hidden;
}

/* 左侧：目录区（可滚） */
.body-left {
  width: 162px;
  flex: 0 0 auto;
  height: 100%;
  background: #fff;
  padding: 16px;
  box-sizing: border-box;
  overflow: hidden;
}

/* ✅ left-panel 变成“整块可滚区域” */
.left-panel {
  height: 100%;
  overflow: auto;
  box-sizing: border-box;
}

/* 右侧：唯一滚动区域 */
.body-right {
  flex: 1;
  min-width: 0;
  height: 100%;
  background: transparent;
  box-sizing: border-box;
  overflow: auto;
  padding-bottom: 12px;
}

/* 淡色滚动条（右侧 + 左侧目录） */
.body-right::-webkit-scrollbar,
.left-panel::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}
.body-right::-webkit-scrollbar-track,
.left-panel::-webkit-scrollbar-track {
  background: transparent;
}
.body-right::-webkit-scrollbar-thumb,
.left-panel::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.15);
  border-radius: 999px;
}
.body-right::-webkit-scrollbar-thumb:hover,
.left-panel::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 0, 0, 0.25);
}

.body-right,
.left-panel {
  scrollbar-width: thin;
  scrollbar-color: rgba(0, 0, 0, 0.18) transparent;
}
</style>
