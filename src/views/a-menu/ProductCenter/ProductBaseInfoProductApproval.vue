<template>
  <div>
    <div v-if="loading">加载中...</div>
    <div v-else-if="error">加载失败</div>

    <div v-else class="approvalProductData">
      <a-card class="test1">
        <!-- Tabs（显示统计数据） -->
        <a-tabs v-model:active-key="activeTab">
          <a-tab-pane
              v-for="item in tabList"
              :key="item.value"
              :title="`${item.label} (${item.count})`"
          />
        </a-tabs>
      </a-card>
      <a-card>
        <a-table
            :data="filteredListData"
            :columns="columns"
            row-key="id"
            bordered
            :scroll="{ x: 'max-content' }"
            column-resizable
            class="custom-table"
            :row-selection="rowSelection"
        >
          <template #country="{ record }">
            <span class="table-cell-content">{{ record.countryList?.[0]?.name || '-' }}</span>
          </template>

          <template #category="{ record }">
            <span class="table-cell-content">
              {{ record.productClass?.parent?.parent?.categoryName || '-' }} /
              {{ record.productClass?.parent?.categoryName || '-' }} /
              {{ record.productClass?.categoryName || '-' }}
            </span>
          </template>

          <template #nodeUser="{ record }">
            <span class="table-cell-content">{{ record.approvalFlow?.currentNode?.processUsers?.[0]?.processUser?.name || '-' }}</span>
          </template>

          <template #actions="{ record: _record }">
            <a-button type="primary" size="mini">操作</a-button>
          </template>
        </a-table>
      </a-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { getApprovalProductStats, getApprovalProductList } from "@/api/approvalProduct.ts";

const data1 = ref<{
  total: number;
  pending: number;
  done: number;
  rejected: number;
  draft: number;
  cancellation: number;
} | null>(null);

// 存储所有数据（一次性加载）
const allListData = ref<any[]>([]);

const loading = ref(true);
const error = ref(false);

// 选中的 tab（value）
const activeTab = ref("");



// 表格列定义
const columns = [
  // 第一列：单据编号（冻结）
  {
    title: '单据编号',
    dataIndex: 'approveNo',
    width: 120,
    fixed: 'left',
  },
  // 第二列：SKU（冻结）
  {
    title: 'SKU',
    dataIndex: 'sku',
    width: 100,
    fixed: 'left',
  },
  {
    title: '品名',
    dataIndex: 'productName',
    width: 150
  },
  {
    title: '13位编码',
    dataIndex: 'thirteenBitCode',
    width: 130
  },
  {
    title: '工厂型号',
    dataIndex: 'factoryModel',
    width: 120
  },

  // 需要 slot
  {
    title: '国家',
    slotName: 'country',
    width: 90
  },
  {
    title: '分类',
    slotName: 'category',
    width: 200
  },

  // 需要 render
  {
    title: '审批类型',
    dataIndex: 'approvalFlow',
    render: (r: any) => r.approvalFlow?.flowType || '-',
    width: 100
  },
  {
    title: '状态',
    dataIndex: 'approveStatus',
    render: (r: any) => r.approveStatus || '-',
    width: 100
  },
  {
    title: '当前节点',
    dataIndex: 'approvalFlow',
    render: (r: any) => r.approvalFlow?.currentNode?.nameDisplay || '-',
    width: 120
  },

  // slot
  {
    title: '处理人',
    slotName: 'nodeUser',
    width: 120
  },

  {
    title: '原始SKU',
    dataIndex: 'associationProductNo',
    render: (r: any) => r.associationProductNo?.sku || '-',
    width: 100
  },

  {
    title: '备注',
    dataIndex: 'remark',
    width: 120
  },

  {
    title: '创建人',
    dataIndex: 'creator',
    render: (r: any) => r.creator?.name || '-',
    width: 100
  },

  {
    title: '创建时间',
    dataIndex: 'createTime',
    width: 160
  },

  {
    title: '更新人',
    dataIndex: 'updateUser',
    render: (r: any) => r.updateUser?.name || '-',
    width: 100
  },

  {
    title: '更新时间',
    dataIndex: 'modifyTime',
    width: 160
  },

  {
    title: '操作',
    slotName: 'actions',
    width: 120,
    fixed: 'right'
  },
];

// ----------------------
// 计算属性
// ----------------------

// 根据 activeTab 过滤数据
const filteredListData = computed(() => {
  if (!activeTab.value) {
    return allListData.value; // 全部数据
  }

  return allListData.value.filter(item => item.approveStatus === activeTab.value);
});

// 构造 Tab 列表
const tabList = computed(() => {
  if (!data1.value) return [];

  return [
    { label: "全部", value: "", count: data1.value.total },
    { label: "待提交", value: "DRAFT", count: data1.value.draft },
    { label: "审批中", value: "PENDING", count: data1.value.pending },
    { label: "已完成", value: "DONE", count: data1.value.done },
    { label: "已驳回", value: "REJECTED", count: data1.value.rejected },
    { label: "已作废", value: "CANCELLATION", count: data1.value.cancellation },
  ];
});

// 行选择配置 - 简化版本，确保能正常工作
const rowSelection = {
  type: 'checkbox',
  showCheckedAll: true,
  onlyCurrent: false,
};

// ----------------------
// 生命周期
// ----------------------

onMounted(async () => {
  try {
    loading.value = true;

    // 并行请求统计数据和所有列表数据
    const [statsRes, listRes] = await Promise.all([
      getApprovalProductStats(),
      getApprovalProductList() // 获取所有数据，不传参数
    ]);

    data1.value = statsRes;
    allListData.value = listRes.searchApprovalProduct.list;

  } catch (e) {
    error.value = true;
    console.error('加载数据失败:', e);
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped>
.approvalProductData {
  color: black;
}

.test1 {
  margin: -10px 0;
}

/* 表格设置最小宽度，确保所有列能在一行显示 */
.custom-table {
  width: 100%;
  min-width: 1600px;
}

/* 使用深度选择器穿透scoped样式，表头加粗且不换行 */
.custom-table :deep(.arco-table-th) {
  font-weight: 700 !important;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;

  /* 只在标题行添加列分隔线 */
  border-right: 1px solid #e5e6eb !important;
}

/* 单元格不换行 */
.custom-table :deep(.arco-table-td) {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;

  /* 内容行不需要列分隔线 */
  border-right: none !important;
}

/* 最后一列不需要右边框 */
.custom-table :deep(.arco-table-th:last-child) {
  border-right: none !important;
}

/* 固定列的样式调整 */
.custom-table :deep(.arco-table-col-fixed-left-last) {
  border-right: 2px solid #e5e6eb !important; /* 固定列右侧加粗分隔线 */
}

.custom-table :deep(.arco-table-col-fixed-right-first) {
  border-left: 2px solid #e5e6eb !important; /* 固定列左侧加粗分隔线 */
}

/* 表格单元格内容样式 */
.table-cell-content {
  display: block;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* 确保表格容器可以横向滚动 */
.custom-table :deep(.arco-table-container) {
  overflow-x: auto;
}

/* 复选框列样式 */
.custom-table :deep(.arco-table-selection) {
  position: sticky;
  left: 0;
  z-index: 3;
  background: white;
  border-right: 2px solid #e5e6eb !important;
}

/* 确保复选框可以正常显示和点击 */
.custom-table :deep(.arco-checkbox) {
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

/* 固定列阴影效果 */
.custom-table :deep(.arco-table-fixed-left) {
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.1);
}

.custom-table :deep(.arco-table-fixed-right) {
  box-shadow: -2px 0 8px rgba(0, 0, 0, 0.1);
}
</style>

<!-- 全局样式：隐藏 a-card 上边框 -->
<style>
.approvalProductData .arco-card {
  border-top: none !important;
}
</style>