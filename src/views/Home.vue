<template>
  <div class="home-page">
    <Navbar
        v-if="options.length"
        :value="selectedValue"
        :onChange="handleChange"
        :options="options"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import Navbar from '@/components/Navbar/Navbar.vue'
import { getCategoryList } from '@/api/category.ts'
import { buildTree } from '@/utils/buildTree.ts'

interface Category {
  id: string
  categoryName: string
  parentId?: string
  itemCount?: string
  children?: Category[]
}

const selectedValue = ref('')
const options = ref<any[]>([])

//  页面加载时调用接口
onMounted(async () => {
  await loadCategories()
})

// 封装查询逻辑
const loadCategories = async () => {
  try {
    const rawList = await getCategoryList()
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
    console.error('分类查询失败', err)
  }
}

// 接收 Navbar 的回调
const handleChange = (val: string) => {
  selectedValue.value = val
  console.log('选中项：', val)
}
</script>
