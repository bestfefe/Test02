<template>
  <div class="home-page">
    <a-button type="primary" @click="handleQuery">查询</a-button>
    <Navbar
        v-if="options.length"
        :value="selectedValue"
        :onChange="handleChange"
        :options="options"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import axios from 'axios'
import Navbar from '@/components/Navbar/Navbar.vue'
import { buildTree } from '@/utils/buildTree'

interface Category {
  id: string
  categoryName: string
  parentId?: string
  itemCount?: string
  children?: Category[]
}

const selectedValue = ref('')
const options = ref<any[]>([])

const query = `
{
  searchCategory(condition: {
    orders: [{ field: "createTime", order: "asc" }],
    queries: { field: "categoryType", type: "equals", values: "PRODUCT" }
  }) {
    list {
      id
      categoryName
      parentId
      itemCount
    }
  }
}`

const handleQuery = async () => {
  try {
    const res = await axios.post('/api/graphql', { query }, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    })
    const rawList = res.data.data.searchCategory.list
    const tree = buildTree(rawList)

    options.value = tree.map((item: Category) => ({
      label: item.categoryName,
      value: item.id,
      children: item.children?.map((c1: Category) => ({
        label: c1.categoryName,
        value: c1.id,
        children: c1.children?.map((c2: Category) => ({
          label: c2.categoryName,
          value: c2.id,
          children: c2.children?.map((c3: Category) => ({
            label: c3.categoryName,
            value: c3.id
          }))
        }))
      }))
    }))

  } catch (err) {
    console.error('查询失败', err)
  }
}

const handleChange = (val: string) => {
  selectedValue.value = val
  console.log('选中项：', val)
}
</script>
