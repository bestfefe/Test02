<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue';
import { Message } from '@arco-design/web-vue';
import BaseAddModal from '@/components/BaseAddModal';
import AsteriskIcon from '@/components/Icon/Asterisk.vue';
import { testProductLibrary, testProductSku } from '@/api/TestApi';
import { useRouter } from 'vue-router';

const router = useRouter();

/** ✅ 改成你 AddApproval.vue 对应的真实路由 path */
const ADD_APPROVAL_PATH = '/addapproval';

type ApprovalType = 'new-project' | 'old-project' | 'iterative-project';
const approvalType = ref<ApprovalType>();

interface ProductItem {
  id: string;
  sku: string;
}

/* ======================
 * 产品库（A）
 * ====================== */
const libraryLoading = ref(false);
const libraryData = ref<ProductItem[]>([]);

const loadProductLibrary = async () => {
  try {
    libraryLoading.value = true;
    const res = await testProductLibrary();
    libraryData.value = res?.searchApprovalProduct?.list ?? [];
  } catch {
    libraryData.value = [];
  } finally {
    libraryLoading.value = false;
  }
};

const productLibraryOptions = computed(() =>
    libraryData.value.map((item) => ({ label: item.sku, value: item.id }))
);

/* ======================
 * SKU（B）
 * ====================== */
const skuLoading = ref(false);
const skuData = ref<ProductItem[]>([]);

const loadProductSku = async () => {
  try {
    skuLoading.value = true;
    const res = await testProductSku();
    skuData.value = res?.searchApprovalProduct?.list ?? [];
  } catch {
    skuData.value = [];
  } finally {
    skuLoading.value = false;
  }
};

const skuOptions = computed(() =>
    skuData.value.map((item) => ({ label: item.sku, value: item.id }))
);

/* ======================
 * 表单字段
 * ====================== */
const productLibraryId = ref<string>();
const skuId = ref<string>();
const copySkuId = ref<string>();

/** 可选：用于按钮禁用（你现在 BaseAddModal 不支持可先不用） */
const canSubmit = computed(() => {
  if (!approvalType.value) return false;
  if (approvalType.value === 'new-project') return !!productLibraryId.value;
  if (approvalType.value === 'old-project') return !!skuId.value;
  if (approvalType.value === 'iterative-project') return !!productLibraryId.value && !!skuId.value;
  return false;
});

/** ✅ 强制清理 Arco Modal 对 body/html 的副作用（根治挤压） */
const resetBodyAfterModal = () => {
  const body = document.body;
  const html = document.documentElement;

  // Arco/弹窗常见副作用
  body.style.overflow = '';
  body.style.paddingRight = '';
  body.style.width = '';
  body.style.position = '';
  body.style.top = '';

  html.style.overflow = '';
  html.style.paddingRight = '';

  // 有些项目会加这个 class（不同版本可能不同，清掉不影响）
  body.classList.remove('arco-modal-open');
  body.classList.remove('arco-overlay-open');

  // 🔥 通知布局系统重新计算（tagsView/layout 常靠 resize 重算宽度）
  window.dispatchEvent(new Event('resize'));
};

const waitFrame = () => new Promise<void>((r) => requestAnimationFrame(() => r()));

/** ✅ 点击 BaseAddModal 的确定：带 close 参数 */
const handleConfirm = async (close: () => void) => {
  // 1) 校验（不通过：提示 + 不关闭）
  if (!approvalType.value) {
    Message.warning('请先选择审批类型');
    return;
  }

  if (approvalType.value === 'new-project' && !productLibraryId.value) {
    Message.warning('新品请先选择产品库');
    return;
  }

  if (approvalType.value === 'old-project' && !skuId.value) {
    Message.warning('老品请先选择 SKU');
    return;
  }

  if (approvalType.value === 'iterative-project') {
    if (!productLibraryId.value) {
      Message.warning('迭代品请先选择产品库');
      return;
    }
    if (!skuId.value) {
      Message.warning('迭代品请先选择 SKU');
      return;
    }
  }

  // 2) ✅ 先关闭弹窗
  close();

  // 3) ✅ 等待弹窗关闭动画/DOM 更新
  await nextTick();
  await waitFrame();

  // 4) ✅ 根治：清理 body/html 残留 & 触发布局重算
  resetBodyAfterModal();

  // 5) ✅ 再跳转
  await router.push({
    path: ADD_APPROVAL_PATH,
    query: {
      type: approvalType.value,
      productLibraryId: productLibraryId.value,
      skuId: skuId.value,
      copySkuId: copySkuId.value,
    },
  });
};

onMounted(() => {
  loadProductLibrary();
  loadProductSku();
});
</script>

<template>
  <BaseAddModal title="添加产品审批需求" :width="520" @confirm="handleConfirm">
    <a-form
        layout="horizontal"
        :label-col-props="{ span: 5 }"
        :wrapper-col-props="{ span: 19 }"
        style="width: 450px"
    >
      <div class="approval-form">
        <!-- 审批类型 -->
        <a-form-item>
          <template #label>
            <span class="form-label">
              <AsteriskIcon class="required-icon" />
              审批类型
            </span>
          </template>

          <a-select v-model="approvalType" placeholder="请选择">
            <a-option value="new-project">新品</a-option>
            <a-option value="old-project">老品</a-option>
            <a-option value="iterative-project">迭代品</a-option>
          </a-select>
        </a-form-item>

        <!-- 新品 -->
        <template v-if="approvalType === 'new-project'">
          <a-form-item>
            <template #label>
              <span class="form-label">
                <AsteriskIcon class="required-icon" />
                产品库
              </span>
            </template>

            <a-select
                v-model="productLibraryId"
                :options="productLibraryOptions"
                :loading="libraryLoading"
                placeholder="请选择"
            />
          </a-form-item>

          <a-form-item label="复制 SKU">
            <a-select
                v-model="copySkuId"
                :options="skuOptions"
                :loading="skuLoading"
                placeholder="请选择"
            />
          </a-form-item>
        </template>

        <!-- 老品 -->
        <template v-else-if="approvalType === 'old-project'">
          <a-form-item>
            <template #label>
              <span class="form-label">
                <AsteriskIcon class="required-icon" />
                SKU
              </span>
            </template>

            <a-select
                v-model="skuId"
                :options="skuOptions"
                :loading="skuLoading"
                placeholder="请选择"
            />
          </a-form-item>
        </template>

        <!-- 迭代品 -->
        <template v-else-if="approvalType === 'iterative-project'">
          <a-form-item>
            <template #label>
              <span class="form-label">
                <AsteriskIcon class="required-icon" />
                产品库
              </span>
            </template>

            <a-select
                v-model="productLibraryId"
                :options="productLibraryOptions"
                :loading="libraryLoading"
                placeholder="请选择"
            />
          </a-form-item>

          <a-form-item>
            <template #label>
              <span class="form-label">
                <AsteriskIcon class="required-icon" />
                SKU
              </span>
            </template>

            <a-select
                v-model="skuId"
                :options="skuOptions"
                :loading="skuLoading"
                placeholder="请选择"
            />
          </a-form-item>
        </template>

        <!-- 调试用（需要可打开看看必填状态） -->
        <!-- <div style="font-size:12px;color:#999">canSubmit: {{ canSubmit }}</div> -->
      </div>
    </a-form>
  </BaseAddModal>
</template>

<style scoped>
.required-icon {
  font-size: 12px;
  color: #f53f3f;
}
.form-label {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}
:deep(.arco-form-item-label) {
  font-size: 12px;
}
</style>
