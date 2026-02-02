<script setup>
import { inject, ref, onMounted, onBeforeUnmount } from 'vue';

const props = defineProps({
  id: { type: String, required: true },
  title: { type: String, required: true },
});

const elRef = ref(null);

// 从父级注入注册函数
const registerSection = inject('registerSection', null);
const unregisterSection = inject('unregisterSection', null);

onMounted(() => {
  registerSection?.({
    id: props.id,
    title: props.title,
    el: elRef.value,
  });
});

onBeforeUnmount(() => {
  unregisterSection?.(props.id);
});
</script>

<template>
  <div ref="elRef" :data-section-id="id">
    <slot />
  </div>
</template>
