<template>
  <div>
    <h2>GraphQL 测试页面</h2>

    <div style="margin: 20px 0; display: flex; gap: 10px;">
      <a-button @click="loadSupplierData">测试供应商数据</a-button>
      <a-button @click="loadProductLibraryData" type="primary">测试产品库数据</a-button>
      <a-button @click="loadProductSkuData" type="primary">测试SKU数据</a-button>
    </div>

    <!-- 供应商数据 -->
    <div v-if="supplierList.length > 0">
      <h3>供应商数据 (共 {{ supplierList.length }} 条)</h3>
      <div v-for="item in supplierList.slice(0, 5)" :key="item.id" style="margin: 10px 0; padding: 10px; border: 1px solid #eee; border-radius: 4px;">
        <div><strong>名称：</strong>{{ item.name }}</div>
        <div><strong>编码：</strong>{{ item.code }}</div>
        <div><strong>状态：</strong>{{ item.status }}</div>
        <div><strong>创建时间：</strong>{{ item.createTime }}</div>
      </div>
      <div v-if="supplierList.length > 5">... 还有 {{ supplierList.length - 5 }} 条数据未显示</div>
    </div>

    <!-- 产品库数据 -->
    <div v-if="productLibraryList.length > 0">
      <h3>产品库数据 (共 {{ productLibraryList.length }} 条)</h3>
      <div style="margin: 10px 0;">
        <strong>数据格式：</strong>
        <pre>{{ JSON.stringify(productLibraryList[0], null, 2) }}</pre>
      </div>
      <div v-for="(item, index) in productLibraryList.slice(0, 10)" :key="item.id" style="margin: 5px 0; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
        <div><strong>序号：</strong>{{ index + 1 }}</div>
        <div><strong>ID：</strong>{{ item.id }}</div>
        <div><strong>SKU：</strong>{{ item.sku }}</div>
      </div>
      <div v-if="productLibraryList.length > 10">... 还有 {{ productLibraryList.length - 10 }} 条数据未显示</div>
    </div>

    <!-- SKU数据 -->
    <div v-if="skuList.length > 0">
      <h3>SKU数据 (共 {{ skuList.length }} 条)</h3>
      <div style="margin: 10px 0;">
        <strong>数据格式：</strong>
        <pre>{{ JSON.stringify(skuList[0], null, 2) }}</pre>
      </div>
      <div v-for="(item, index) in skuList.slice(0, 10)" :key="item.id" style="margin: 5px 0; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
        <div><strong>序号：</strong>{{ index + 1 }}</div>
        <div><strong>ID：</strong>{{ item.id }}</div>
        <div><strong>SKU：</strong>{{ item.sku }}</div>
      </div>
      <div v-if="skuList.length > 10">... 还有 {{ skuList.length - 10 }} 条数据未显示</div>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading">加载中...</div>

    <!-- 错误时 -->
    <div v-else-if="error" style="color: red; margin: 10px 0;">
      <h3>请求错误</h3>
      <div>{{ error }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { testSearchSupplier, testProductLibrary, testProductSku } from '@/api/TestApi'

const supplierList = ref<any[]>([])
const productLibraryList = ref<any[]>([])
const skuList = ref<any[]>([])
const loading = ref(false)
const error = ref('')

const loadSupplierData = async () => {
  try {
    loading.value = true
    error.value = ''
    supplierList.value = []
    productLibraryList.value = []
    skuList.value = []

    const res = await testSearchSupplier()
    supplierList.value = res?.searchSupplier?.list || []
    console.log('供应商数据加载成功:', supplierList.value.length)
  } catch (err: any) {
    error.value = err.message || String(err)
    console.error('供应商数据加载失败:', err)
  } finally {
    loading.value = false
  }
}

const loadProductLibraryData = async () => {
  try {
    loading.value = true
    error.value = ''
    supplierList.value = []
    productLibraryList.value = []
    skuList.value = []

    const res = await testProductLibrary()
    productLibraryList.value = res?.searchApprovalProduct?.list || []
    console.log('产品库数据加载成功:', productLibraryList.value.length)
  } catch (err: any) {
    error.value = err.message || String(err)
    console.error('产品库数据加载失败:', err)
  } finally {
    loading.value = false
  }
}

const loadProductSkuData = async () => {
  try {
    loading.value = true
    error.value = ''
    supplierList.value = []
    productLibraryList.value = []
    skuList.value = []

    const res = await testProductSku()
    skuList.value = res?.searchApprovalProduct?.list || []
    console.log('SKU数据加载成功:', skuList.value.length)
  } catch (err: any) {
    error.value = err.message || String(err)
    console.error('SKU数据加载失败:', err)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
:global(body) {
  color: #000;
}
</style>