<!-- GraphQLDebug.vue -->
<template>
  <div class="debug-panel">
    <h3>GraphQL 调试面板</h3>

    <div class="control-panel">
      <a-button @click="loadAllData" :loading="loading">
        测试所有 GraphQL 查询
      </a-button>
      <a-button @click="loadProductLibraryData" :loading="libraryLoading">
        仅测试产品库
      </a-button>
      <a-button @click="loadProductSkuData" :loading="skuLoading">
        仅测试 SKU
      </a-button>
      <a-button @click="clearResults" type="outline">
        清空结果
      </a-button>
    </div>

    <div class="results">
      <!-- 产品库数据 -->
      <div v-if="libraryResults.length > 0" class="result-section">
        <h4>产品库数据 ({{ libraryResults.length }}条)</h4>
        <div class="data-list">
          <div v-for="(item, index) in libraryResults.slice(0, 5)" :key="item.id" class="data-item">
            <div><strong>序号:</strong> {{ index + 1 }}</div>
            <div><strong>ID:</strong> {{ item.id }}</div>
            <div><strong>SKU:</strong> {{ item.sku }}</div>
          </div>
          <div v-if="libraryResults.length > 5" class="more-data">
            还有 {{ libraryResults.length - 5 }} 条数据...
          </div>
        </div>
      </div>

      <!-- SKU数据 -->
      <div v-if="skuResults.length > 0" class="result-section">
        <h4>SKU数据 ({{ skuResults.length }}条)</h4>
        <div class="data-list">
          <div v-for="(item, index) in skuResults.slice(0, 5)" :key="item.id" class="data-item">
            <div><strong>序号:</strong> {{ index + 1 }}</div>
            <div><strong>ID:</strong> {{ item.id }}</div>
            <div><strong>SKU:</strong> {{ item.sku }}</div>
          </div>
          <div v-if="skuResults.length > 5" class="more-data">
            还有 {{ skuResults.length - 5 }} 条数据...
          </div>
        </div>
      </div>

      <!-- 错误信息 -->
      <div v-if="libraryError || skuError" class="error-section">
        <h4>错误信息</h4>
        <div v-if="libraryError" class="error-item">
          <strong>产品库错误:</strong> {{ libraryError }}
        </div>
        <div v-if="skuError" class="error-item">
          <strong>SKU错误:</strong> {{ skuError }}
        </div>
      </div>

      <!-- 加载状态 -->
      <div v-if="loading || libraryLoading || skuLoading" class="loading-section">
        加载中...
      </div>

      <!-- 没有数据时的提示 -->
      <div v-if="!loading && !libraryLoading && !skuLoading && libraryResults.length === 0 && skuResults.length === 0"
           class="empty-section">
        请点击上方按钮加载数据
      </div>

      <!-- 原始查询结果（用于调试） -->
      <div v-if="rawLibraryData || rawSkuData" class="raw-results">
        <h4>原始查询结果</h4>
        <details>
          <summary>点击查看原始数据</summary>
          <div class="raw-data">
            <h5>产品库原始数据:</h5>
            <pre>{{ JSON.stringify(rawLibraryData, null, 2) }}</pre>
            <h5>SKU原始数据:</h5>
            <pre>{{ JSON.stringify(rawSkuData, null, 2) }}</pre>
          </div>
        </details>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { testProductLibrary, testProductSku } from '@/api/TestApi';

// 状态管理
const libraryResults = ref<any[]>([]);
const skuResults = ref<any[]>([]);
const rawLibraryData = ref<any>(null);
const rawSkuData = ref<any>(null);
const libraryError = ref<string>('');
const skuError = ref<string>('');
const loading = ref(false);
const libraryLoading = ref(false);
const skuLoading = ref(false);

// 加载所有数据
const loadAllData = async () => {
  console.log('开始测试所有 GraphQL 查询...');
  loading.value = true;
  libraryError.value = '';
  skuError.value = '';
  libraryResults.value = [];
  skuResults.value = [];

  try {
    // 并行加载两个查询
    await Promise.all([
      loadProductLibraryData(),
      loadProductSkuData()
    ]);
  } catch (error) {
    console.error('加载数据时出错:', error);
  } finally {
    loading.value = false;
  }
};

// 加载产品库数据
const loadProductLibraryData = async () => {
  try {
    console.log('开始加载产品库数据...');
    libraryLoading.value = true;
    libraryError.value = '';

    const res = await testProductLibrary();
    console.log('产品库查询结果:', res);

    rawLibraryData.value = res;

    if (res?.searchApprovalProduct?.list) {
      libraryResults.value = res.searchApprovalProduct.list;
      console.log('产品库数据加载成功:', libraryResults.value.length);
    } else {
      console.warn('产品库查询返回的数据格式不正确:', res);
      libraryResults.value = [];
      libraryError.value = '产品库查询返回的数据格式不正确';
    }
  } catch (err: any) {
    console.error('产品库查询失败:', err);
    libraryError.value = err.message || String(err);
  } finally {
    libraryLoading.value = false;
  }
};

// 加载SKU数据
const loadProductSkuData = async () => {
  try {
    console.log('开始加载SKU数据...');
    skuLoading.value = true;
    skuError.value = '';

    const res = await testProductSku();
    console.log('SKU查询结果:', res);

    rawSkuData.value = res;

    if (res?.searchApprovalProduct?.list) {
      skuResults.value = res.searchApprovalProduct.list;
      console.log('SKU数据加载成功:', skuResults.value.length);
    } else {
      console.warn('SKU查询返回的数据格式不正确:', res);
      skuResults.value = [];
      skuError.value = 'SKU查询返回的数据格式不正确';
    }
  } catch (err: any) {
    console.error('SKU查询失败:', err);
    skuError.value = err.message || String(err);
  } finally {
    skuLoading.value = false;
  }
};

// 清空结果
const clearResults = () => {
  libraryResults.value = [];
  skuResults.value = [];
  rawLibraryData.value = null;
  rawSkuData.value = null;
  libraryError.value = '';
  skuError.value = '';
};
</script>

<style scoped>
/* 样式保持不变 */
:deep(*) {
  color: #000 !important;
}
</style>