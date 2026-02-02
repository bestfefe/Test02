<template>
  <div class="base-grid" :style="gridStyle">
    <slot />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps({
  cols: { type: Number, default: 3 },
  gap: { type: [Number, String], default: 24 }, // 24 或 '24px'
});

const gridStyle = computed(() => {
  const gap = typeof props.gap === 'number' ? `${props.gap}px` : props.gap;
  return {
    gridTemplateColumns: `repeat(${props.cols}, minmax(0, 1fr))`,
    gap,
  };
});
</script>

<style scoped>
.base-grid {
  display: grid;
  align-items: start;
  justify-items: stretch; /* ✅ 防止像你截图那样整体居中 */
  width: 100%;
}
</style>
