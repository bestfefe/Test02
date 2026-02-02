<script setup lang="ts">
import { ref, defineProps, defineEmits } from 'vue';
import { IconPlus } from '@arco-design/web-vue/es/icon';

const props = defineProps<{
  buttonSize?: 'mini' | 'small' | 'medium' | 'large';
  title?: string;
}>();

const emit = defineEmits<{
  (e: 'confirm', close: () => void): void;
}>();

const visible = ref(false);

const open = () => (visible.value = true);
const close = () => (visible.value = false);

const handleOk = () => {
  emit('confirm', close);
};
</script>

<template>
  <a-button type="primary" :size="props.buttonSize || 'small'" @click="open">
    <template #icon>
      <icon-plus />
    </template>
    添加
  </a-button>

  <a-modal
      v-model:visible="visible"
      :title="props.title || '添加'"
      size="small"
      :width="500"
      title-align="start"
      unmount-on-close
      @ok="handleOk"
  >
    <slot />
  </a-modal>
</template>

<style scoped>
.arco-btn {
  font-size: 12px !important;
  line-height: 22px !important;
}
.arco-modal-header .arco-modal-title-align-start {
  justify-content: flex-start !important;
}
.arco-modal-title {
  font-size: 16px !important;
}
</style>
