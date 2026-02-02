<template>
  <a-card class="base-card" :bordered="false" :body-style="{ padding: '16px' }">
    <div v-if="title" class="base-card-title">
      {{title}}
    </div>
    <slot />
  </a-card>
</template>

<script setup lang="ts">
defineProps({
  title: {
    type: String,
    default: '',
  },
});
</script>
<style scoped>
.base-card {
  margin-bottom: 16px;
}
.base-card:last-child {
  margin-bottom: 0;
}
.base-card-title {
  display: flex;
  align-items: center;

  font-size: 14px;
  font-weight: 700;
  color: var(--color-text-1);
  line-height: 16px;

  margin-bottom: 16px;

  padding-left: 6px;          /* 文字和蓝条的间距 */
  border-left: 3px solid #005bf5;
}
</style>
