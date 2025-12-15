<template>
<div >
  <div>
    <h2>GraphQL 测试数据</h2>

    <!-- 加载状态 -->
    <div v-if="loading">加载中...</div>

    <!-- 错误时 -->
    <div v-else-if="error">请求错误：{{ error }}</div>

    <!-- 数据展示 -->
    <div v-else>
      <div v-for="item in list" :key="item.id" style="margin: 10px 0">
        <div>名称：{{ item.name }}</div>
        <div>编码：{{ item.code }}</div>
      </div>
    </div>
  </div>
</div>
</template>

<script setup lang="ts">
import {onMounted, ref} from 'vue'
import { testSearchSupplier } from '@/api/TestApi'

const list = ref<any[]>([])
const loading = ref(true)
const error = ref('')

onMounted(async ()=>{
  try {
    const res = await testSearchSupplier()
    list.value = res?.searchSupplier?.list||[]
  }catch (err:ant){
    error.value = err.message||String(err)
  }finally {
    loading.value = false
  }
})
</script>

<style scoped>
:global(body) {
  color: #000;
}
</style>