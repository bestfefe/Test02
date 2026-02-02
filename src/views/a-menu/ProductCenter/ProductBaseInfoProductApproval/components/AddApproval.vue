<script setup lang="ts">
import { ref, computed, provide, reactive, onMounted, onBeforeUnmount, nextTick, watchEffect, watch } from 'vue';
import { useRoute } from 'vue-router';
import { Message } from '@arco-design/web-vue';

import ApproveWrapper from '@/components/business/approve-wrapper/index.vue';
import ApproveSection from './ApproveSection.vue'; //
import BaseCard from '@/components/Base/Card.vue';
import BaseField from '@/components/Base/BaseField.vue';
import BaseGrid from '@/components/Base/BaseGrid.vue';
import AsteriskIcon from '@/components/Icon/Asterisk.vue';

type ApprovalType = 'new-project' | 'old-project' | 'iterative-project';

const route = useRoute();

const onConfirm = () => {};
const onSave = () => {};
const onBack = () => {};

/** =========================
 * 1) 从 query 解析参数
 * ========================= */
function getQueryString(key: string): string | undefined {
  const v = route.query[key];
  if (Array.isArray(v)) return v[0];
  return v as string | undefined;
}

const approvalType = computed<ApprovalType | undefined>(() => {
  return getQueryString('type') as ApprovalType | undefined;
});
const productLibraryId = computed(() => getQueryString('productLibraryId'));
const skuId = computed(() => getQueryString('skuId'));
const copySkuId = computed(() => getQueryString('copySkuId'));

/** =========================
 * 2) 页面表单数据（原来写死的都放进来）
 * ========================= */
const form = ref({
  unifiedSku: '',
  cnName: '',
  enName: '',
  factoryModel: '',
  shortCode: '',
  productModelText: '主产品',
  ingredientText: '01-蜡烛壁炉',
  brandType: '',
  brand: '',
  material: '',
  targetCountry: '',
  store: '',
  productLevel: '',
  newLevel: '',
  packingStrap: '',
  nailRow: '',
  seriesName: '',
  mixGroup: '',
});

/** =========================
 * 3) 根据 query 初始化数据（你替换成真实接口）
 * ========================= */

// ✅ 示例：产品库详情（你换成真实接口）
async function fetchLibraryDetail(id: string) {
  // TODO: const res = await api.getProductLibraryDetail(id)
  // return res
  return {
    unifiedSku: `LIB-${id}`,
    cnName: '立式冰柜',
    enName: 'Vertical freezer',
    factoryModel: 'JD-2B',
    shortCode: '020',
    brandType: '铭牌',
    brand: 'Electric',
    targetCountry: '美国',
    productLevel: 'C类',
    newLevel: '请选择',
    packingStrap: '有   无',
    nailRow: '有   无',
    mixGroup: 'U36',
  };
}

// ✅ 示例：SKU 详情（你换成真实接口）
async function fetchSkuDetail(id: string) {
  // TODO: const res = await api.getSkuDetail(id)
  // return res
  return {
    unifiedSku: `SKU-${id}`,
    cnName: 'SKU中文品名(示例)',
    enName: 'SKU English Name (Demo)',
    factoryModel: 'SKU-FM-001',
    brandType: 'SKU品牌类型(示例)',
    brand: 'SKU品牌(示例)',
    targetCountry: '美国',
  };
}

async function initByRoute() {
  // 没带 type 就不初始化
  if (!approvalType.value) return;

  // 先清空/重置（避免 tagsView 复用导致上一条数据残留）
  form.value = {
    unifiedSku: '',
    cnName: '',
    enName: '',
    factoryModel: '',
    shortCode: '',
    productModelText: '主产品',
    ingredientText: '01-蜡烛壁炉',
    brandType: '',
    brand: '',
    material: '',
    targetCountry: '',
    store: '',
    productLevel: '',
    newLevel: '',
    packingStrap: '',
    nailRow: '',
    seriesName: '',
    mixGroup: '',
  };

  // ✅ 根据审批类型做必填校验
  if (approvalType.value === 'new-project') {
    if (!productLibraryId.value) {
      Message.warning('新品缺少产品库参数 productLibraryId');
      return;
    }
  }
  if (approvalType.value === 'old-project') {
    if (!skuId.value) {
      Message.warning('老品缺少 SKU 参数 skuId');
      return;
    }
  }
  if (approvalType.value === 'iterative-project') {
    if (!productLibraryId.value || !skuId.value) {
      Message.warning('迭代品缺少参数 productLibraryId 或 skuId');
      return;
    }
  }

  // ✅ 初始化逻辑
  try {
    if (approvalType.value === 'new-project') {
      // A: 用产品库初始化
      const lib = await fetchLibraryDetail(productLibraryId.value!);
      form.value = { ...form.value, ...lib };

      // B: 如有 copySkuId，则用 sku 覆盖一部分字段（复制初始化）
      if (copySkuId.value) {
        const sku = await fetchSkuDetail(copySkuId.value);
        form.value = { ...form.value, ...sku };
      }

      // 演示：把来源写进系列名，方便你确认绑定已生效（你可以删）
      form.value.seriesName = `来源：产品库(${productLibraryId.value}) 复制SKU(${copySkuId.value || '无'})`;
    }

    if (approvalType.value === 'old-project') {
      // 老品：直接用 sku 初始化
      const sku = await fetchSkuDetail(skuId.value!);
      form.value = { ...form.value, ...sku };
      form.value.seriesName = `来源：老品SKU(${skuId.value})`;
    }

    if (approvalType.value === 'iterative-project') {
      // 迭代：产品库 + sku 合并（按你业务决定优先级）
      const lib = await fetchLibraryDetail(productLibraryId.value!);
      const sku = await fetchSkuDetail(skuId.value!);
      form.value = { ...form.value, ...lib, ...sku };
      form.value.seriesName = `来源：迭代 产品库(${productLibraryId.value}) + SKU(${skuId.value})`;
    }
  } catch (e) {
    console.error(e);
    Message.error('初始化 AddApproval 数据失败，请查看控制台');
  }
}

/** route.query 变化就重新初始化（支持 tagsView/keep-alive） */
watchEffect(() => {
  // 依赖 route.query
  void initByRoute();
});

/** =========================
 * 4) 左侧目录：动态注册（你之前的方案）
 * ========================= */
const wrapperRef = ref<any>(null);
const sections = ref<{ id: string; title: string }[]>([]);
const activeId = ref('');
const sectionEls = reactive(new Map<string, HTMLElement>());
const observedIds = reactive(new Set<string>());
let io: IntersectionObserver | null = null;

provide('registerSection', ({ id, title, el }: { id: string; title: string; el: HTMLElement }) => {
  if (!id) return;

  if (el) sectionEls.set(id, el);

  const idx = sections.value.findIndex((s) => s.id === id);
  if (idx === -1) sections.value.push({ id, title });
  else sections.value[idx].title = title;

  if (!activeId.value) activeId.value = id;

  // 有 IO 就同步 observe
  syncObserve();
});

provide('unregisterSection', (id: string) => {
  const el = sectionEls.get(id);

  if (io && el && observedIds.has(id)) {
    io.unobserve(el);
    observedIds.delete(id);
  }

  sectionEls.delete(id);
  sections.value = sections.value.filter((s) => s.id !== id);

  if (activeId.value === id) {
    activeId.value = sections.value[0]?.id || '';
  }
});

const scrollTo = (id: string) => {
  const scrollEl: HTMLElement | null = wrapperRef.value?.rightScrollEl || null;
  const target = sectionEls.get(id);
  if (!scrollEl || !target) return;

  const top =
      target.getBoundingClientRect().top -
      scrollEl.getBoundingClientRect().top +
      scrollEl.scrollTop;

  scrollEl.scrollTo({ top, behavior: 'smooth' });
};

const syncObserve = () => {
  if (!io) return;
  sections.value.forEach((s) => {
    const el = sectionEls.get(s.id);
    if (el && !observedIds.has(s.id)) {
      io!.observe(el);
      observedIds.add(s.id);
    }
  });
};

onMounted(async () => {
  await nextTick();
  const scrollEl: HTMLElement | null = wrapperRef.value?.rightScrollEl || null;
  if (!scrollEl) return;

  io = new IntersectionObserver(
      (entries) => {
        const visible = entries
            .filter((e) => e.isIntersecting)
            .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);

        if (visible.length > 0) {
          const id = (visible[0].target as HTMLElement).getAttribute('data-section-id');
          if (id) activeId.value = id;
        }
      },
      {
        root: scrollEl,
        rootMargin: '-20% 0px -70% 0px',
        threshold: [0, 0.1],
      }
  );

  syncObserve();
});

watch(
    sections,
    async () => {
      await nextTick();
      syncObserve();
    },
    { deep: true }
);

onBeforeUnmount(() => {
  io?.disconnect();
  io = null;
  observedIds.clear();
});
</script>

<template>
  <ApproveWrapper
      ref="wrapperRef"
      title="产品新增审批"
      @confirm="onConfirm"
      @save="onSave"
      @back="onBack"
  >
    <!-- 左侧目录 -->
    <template #left-panel>
      <div class="toc">
        <div
            v-for="item in sections"
            :key="item.id"
            class="toc-item"
            :class="{ active: activeId === item.id }"
            @click="scrollTo(item.id)"
        >
          {{ item.title }}
        </div>
      </div>
    </template>

    <!-- ✅ 基本信息 -->
    <ApproveSection id="base" title="基本信息">
      <BaseCard title="基本信息">
        <BaseGrid>
          <BaseField label="统一SKU">
            <a-input v-model="form.unifiedSku" />
          </BaseField>

          <BaseField>
            <template #label>
              <span class="form-label">
                <AsteriskIcon class="required-icon" />
                中文品名
              </span>
            </template>
            <a-input v-model="form.cnName" />
          </BaseField>

          <BaseField>
            <template #label>
              <span class="form-label">
                <AsteriskIcon class="required-icon" />
                英文品名
              </span>
            </template>
            <a-input v-model="form.enName" />
          </BaseField>

          <BaseField>
            <template #label>
              <span class="form-label">
                <AsteriskIcon class="required-icon" />
                工厂型号
              </span>
            </template>
            <a-input v-model="form.factoryModel" />
          </BaseField>

          <BaseField label="数字简码">
            <a-input v-model="form.shortCode" />
          </BaseField>

          <BaseField>
            <template #label>
              <span class="form-label">
                <AsteriskIcon class="required-icon" />
                产品型号
              </span>
            </template>
            <a-form-item no-style>
              <div class="display-value">{{ form.productModelText }}</div>
            </a-form-item>
          </BaseField>

          <BaseField>
            <template #label>
              <span class="form-label">
                <AsteriskIcon class="required-icon" />
                产品成分
              </span>
            </template>
            <a-form-item no-style>
              <div class="display-value">{{ form.ingredientText }}</div>
            </a-form-item>
          </BaseField>

          <BaseField>
            <template #label>
              <span class="form-label">
                <AsteriskIcon class="required-icon" />
                品牌类型
              </span>
            </template>
            <a-input v-model="form.brandType" />
          </BaseField>

          <BaseField>
            <template #label>
              <span class="form-label">
                <AsteriskIcon class="required-icon" />
                品牌
              </span>
            </template>
            <a-input v-model="form.brand" />
          </BaseField>

          <BaseField label="产品材质">
            <a-input v-model="form.material" :max-length="30" show-word-limit />
          </BaseField>

          <BaseField>
            <template #label>
              <span class="form-label">
                <AsteriskIcon class="required-icon" />
                目标国家
              </span>
            </template>
            <a-input v-model="form.targetCountry" />
          </BaseField>

          <BaseField label="售卖店铺">
            <a-input v-model="form.store" />
          </BaseField>

          <BaseField>
            <template #label>
              <span class="form-label">
                <AsteriskIcon class="required-icon" />
                产品等级
              </span>
            </template>
            <a-input v-model="form.productLevel" />
          </BaseField>

          <BaseField>
            <template #label>
              <span class="form-label">
                <AsteriskIcon class="required-icon" />
                新品等级
              </span>
            </template>
            <a-input v-model="form.newLevel" />
          </BaseField>

          <BaseField label="打包带">
            <a-input v-model="form.packingStrap" />
          </BaseField>

          <BaseField label="排钉">
            <a-input v-model="form.nailRow" />
          </BaseField>

          <BaseField label="系列名称">
            <a-input v-model="form.seriesName" />
          </BaseField>

          <BaseField label="混发组">
            <a-input v-model="form.mixGroup" />
          </BaseField>
        </BaseGrid>
      </BaseCard>
    </ApproveSection>

    <!-- 其他模块：你先保留占位 -->
    <ApproveSection id="supplier" title="供应商信息">
      <BaseCard title="供应商信息"><div>test02</div></BaseCard>
    </ApproveSection>

    <ApproveSection id="sku" title="SKU&采购信息">
      <BaseCard title="SKU&采购信息"><div>test03</div></BaseCard>
    </ApproveSection>

    <ApproveSection id="detail" title="详细信息">
      <BaseCard title="详细信息"><div>test04</div></BaseCard>
    </ApproveSection>

    <ApproveSection id="spec" title="规格参数">
      <BaseCard title="规格参数"><div>test05</div></BaseCard>
    </ApproveSection>

    <ApproveSection id="material" title="辅料管理">
      <BaseCard title="辅料管理"><div>test06</div></BaseCard>
    </ApproveSection>

    <ApproveSection id="owner" title="负责人&时效">
      <BaseCard title="负责人&时效"><div>test07</div></BaseCard>
    </ApproveSection>

    <ApproveSection id="image" title="图片信息">
      <BaseCard title="图片信息"><div>test08</div></BaseCard>
    </ApproveSection>
  </ApproveWrapper>
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

.toc {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 4px 0;
}

.toc-item {
  height: 32px;
  padding: 0 12px;
  display: flex;
  align-items: center;
  font-size: 12px;
  color: #1d2129;
  border-radius: 2px;
  cursor: pointer;
  user-select: none;
}

.toc-item:hover {
  background: #f2f3f5;
}

.toc-item.active {
  background: #e8f3ff;
  color: #165dff;
}

:deep(.display-value) {
  width: 100%;
  text-align: left;
}
</style>
