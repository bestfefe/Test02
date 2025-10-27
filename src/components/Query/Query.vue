<template>
  <div>
    <a-button @click="handleQuery" type="primary">查询</a-button>

    <a-tree
        class="tree"
        :data="categoryTree"
        :defaultExpandAll="true"
        style="margin-top: 16px;"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import axios from 'axios';
import { buildTree } from '@/utils/buildTree.ts';

interface Category {
  id: string
  categoryName: string
  parentId?: string
  itemCount?: string
}

const categoryTree = ref<Category[]>([])

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
    const res = await axios.post(
        '/api/graphql',
        { query },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
    );
    const rawList = res.data.data.searchCategory.list;
    categoryTree.value = buildTree(rawList);
    console.log('树形结构:', categoryTree.value);
  } catch (err) {
    console.error('查询失败', err);
  }
};
</script>
<style scoped>
.tree :deep(.arco-tree-node-title) {
  color: white;
}
.tree :deep(.arco-tree-node-title:hover) {
  background-color: rgba(22, 93, 255,0.8);
}
</style>