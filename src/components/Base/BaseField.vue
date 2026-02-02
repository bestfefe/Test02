<template>
  <div class="base-field">
    <div v-if="$slots.label || label" class="base-field__label">
      <slot name="label">
        {{ label }}
      </slot>
    </div>

    <div class="base-field__content">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
import { toRefs } from 'vue';

const props = defineProps({
  label: {
    type: String,
    default: '',
  },
});

const { label } = toRefs(props);
</script>



<style scoped>
.base-field {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  width: 100%;
}

/* label 样式：先做最基础的，后面你再加 * 或 tooltip */
.base-field__label {
  font-size: 12px;
  line-height: 28px;
  color: #4e5969;
  margin-bottom: 8px;
  text-align: left;
}

/* ============================= */
/* BaseField 统一 Arco 表单控件 */
/* ============================= */

/* 所有 arco 输入类控件，宽度撑满 */
.base-field__content :deep(
  .arco-input-wrapper,
  .arco-select-view,
  .arco-input-number,
  .arco-picker,
  .arco-textarea-wrapper
) {
  width: 100%;
  box-sizing: border-box;
}

/* 统一“单行控件”的高度 */
.base-field__content :deep(
  .arco-input,
  .arco-input-wrapper,
  .arco-input-wrapper .arco-input,
  .arco-select-view,
  .arco-input-number,
  .arco-picker
) {
  width: 100%;
  font-size: 12px;
  height: 22px;              /* 你可以换成 40px */
  min-height: 22px;
  display: flex;
  align-items: center;
  padding: 2px 0;
}
.base-field__content :deep(.display-value) {
  width: 100%;
  text-align: left;
  color:#1d2129;
  font-size: 14px;
}

</style>
