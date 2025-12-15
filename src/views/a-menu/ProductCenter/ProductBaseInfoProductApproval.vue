<template>
  <div>
    <div v-if="loading">加载中...</div>
    <div v-else-if="error">加载失败</div>

    <div v-else class="approvalProductData">
      <a-card class="test1">
        <!-- 顶部：Tabs（显示统计数据）移动到最前面 -->
        <a-tabs v-model:active-key="activeTab" style="margin-bottom: 12px;">
          <a-tab-pane
              v-for="item in tabList"
              :key="item.value"
              :title="`${item.label} (${item.count})`"
          />
        </a-tabs>

        <!-- 第二行：模式切换 + 下拉筛选 -->
        <div class="control-bar">
          <!-- 模式切换按钮 -->
          <div class="button-group-wrapper">
            <a-button-group>
              <a-button
                  :type="mode === 'SKU' ? 'primary' : 'outline'"
                  :class="['switch-btn', { active: mode === 'SKU' }]"
                  @click="setMode('SKU')"
              >
                SKU
              </a-button>

              <a-button
                  :type="mode === 'SPU' ? 'primary' : 'outline'"
                  :class="['switch-btn', { active: mode === 'SPU' }]"
                  @click="setMode('SPU')"
              >
                SPU
              </a-button>
            </a-button-group>
          </div>

          <!-- 第一行：所有现有的筛选条件保持不变 -->
          <div class="filter-container">
            <div class="filter-group">
              <!-- 现有的筛选字段选择 -->
              <a-select
                  v-model="filterField"
                  :options="filterOptions"
                  style="width: 100px"
                  placeholder="筛选字段"
                  size="small"
              />

              <!-- 现有的查询方式选择 -->
              <a-select
                  v-model="searchType"
                  :options="searchTypeOptions"
                  style="width:90px"
                  placeholder="查询方式"
                  size="small"
              />

              <!-- 现有的搜索输入框 -->
              <a-input-search
                  v-model="searchValue"
                  placeholder="请输入内容查询"
                  style="width:130px"
                  size="small"
                  @press-enter="applyFilter"
              />

              <!-- 国家筛选 -->
              <div class="arco-input-group country-filter-group" size="small">
                <span class="arco-input-wrapper arco-input-disabled search-group-input" style="width: 3em;">
                  <input class="arco-input arco-input-size-small" type="text" disabled value="国家">
                </span>
                <a-select
                    v-model="selectedCountry"
                    :options="countryOptions"
                    placeholder="请选择"
                    style="width: 100px"
                    size="small"
                    allow-clear
                    :loading="countryLoading"
                />
              </div>

              <!-- 审批类型筛选 -->
              <div class="arco-input-group approval-type-filter-group" size="small">
                <span class="arco-input-wrapper arco-input-disabled search-group-input" style="width: 4em;">
                  <input class="arco-input arco-input-size-small" type="text" disabled value="审批类型">
                </span>
                <a-select
                    v-model="selectedApprovalType"
                    :options="approvalTypeOptions"
                    placeholder="请选择"
                    style="width: 100px"
                    size="small"
                    allow-clear
                />
              </div>

              <!-- 树形选择器 -->
              <div class="arco-input-group category-filter-group" size="small">
                <span class="arco-input-wrapper arco-input-disabled search-group-input" style="width: 3em;">
                  <input class="arco-input arco-input-size-small" type="text" disabled value="分类">
                </span>
                <a-tree-select
                    v-model="selectedCategory"
                    :data="categoryTree"
                    placeholder="分类"
                    style="width: 160px"
                    size="small"
                    allow-clear
                    :loading="categoryLoading"
                    :field-names="{ key: 'value', title: 'label' }"
                    :tree-props="{
                      virtualListProps: { height: 300 },
                      height: 300,
                      defaultExpandAll: false
                    }"
                    @change="handleCategoryChange"
                />
              </div>
            </div>

            <!-- 按钮组靠在右侧 -->
            <div class="filter-buttons">
              <!-- 新增：展开/收起按钮 -->
              <a-button
                  type="outline"
                  size="small"
                  @click="toggleExpand"
                  :class="['expand-btn', { 'expand-btn--expanded': isExpanded }]"
              >
                {{ isExpanded ? '收起' : '更多' }}
                <template #icon>
                  <icon-down :class="['expand-icon', { 'expand-icon--rotated': isExpanded }]" />
                </template>
              </a-button>

              <!-- 现有的查询按钮 -->
              <a-button type="primary" size="small" @click="applyFilter">
                查询
              </a-button>

              <!-- 现有的重置按钮 -->
              <a-button size="small" @click="resetFilter" style="margin-left: 8px;">
                重置
              </a-button>
            </div>
          </div>
        </div>

        <!-- 第三行：预留的展开区域 -->
        <div v-if="isExpanded" class="advanced-filters">
          <div class="filter-row">
            <!-- 供应商筛选 -->
            <div class="arco-input-group supplier-filter-group" size="small">
              <span class="arco-input-wrapper arco-input-disabled search-group-input" style="width: 4em;">
                <input class="arco-input arco-input-size-small" type="text" disabled value="供应商">
              </span>
              <a-select
                  v-model="selectedSupplier"
                  :options="supplierOptions"
                  placeholder="请选择供应商"
                  style="width: 160px"
                  size="small"
                  allow-clear
                  :loading="supplierLoading"
                  @dropdown-visible-change="handleSupplierDropdownVisible"
              />
            </div>

            <!-- 用户筛选 -->
            <div class="arco-input-group user-filter-group" size="small">
              <span class="arco-input-wrapper arco-input-disabled search-group-input" style="width: 4em;">
                <input class="arco-input arco-input-size-small" type="text" disabled value="创建人">
              </span>
              <a-select
                  v-model="selectedUser"
                  :options="userOptions"
                  placeholder="请选择创建人"
                  style="width: 160px"
                  size="small"
                  allow-clear
                  :loading="userLoading"
                  @dropdown-visible-change="handleUserDropdownVisible"
              />
            </div>

            <!-- 品牌筛选 -->
            <div class="arco-input-group brand-filter-group" size="small">
              <span class="arco-input-wrapper arco-input-disabled search-group-input" style="width: 3em;">
                <input class="arco-input arco-input-size-small" type="text" disabled value="品牌">
              </span>
              <a-select
                  v-model="selectedBrand"
                  :options="brandOptions"
                  placeholder="请选择品牌"
                  style="width: 140px"
                  size="small"
                  allow-clear
                  :loading="brandLoading"
                  @dropdown-visible-change="handleBrandDropdownVisible"
              />
            </div>

            <!-- 日期筛选 -->
            <div class="arco-input-group date-filter-group" size="small">
              <a-dropdown
                  trigger="click"
                  position="bl"
                  @select="handleDateTypeSelect"
              >
                <div class="date-type-btn">
                  <span class="date-type-label">{{ selectedDateType === 'createTime' ? '创建时间' : '完成时间' }}</span>
                  <icon-down class="date-type-icon" />
                </div>
                <template #content>
                  <a-doption value="createTime">
                    创建时间
                  </a-doption>
                  <a-doption value="endTime">
                    完成时间
                  </a-doption>
                </template>
              </a-dropdown>
              <a-range-picker
                  v-model="dateRange"
                  style="width: 210px; border-left: none; border-radius: 0 6px 6px 0;"
                  size="small"
                  :placeholder="['开始日期', '结束日期']"
                  allow-clear
                  format="YYYY-MM-DD"
                  value-format="YYYY-MM-DD"
                  @clear="handleDateRangeClear"
                  @change="handleDateRangeChange"
              />
            </div>

            <!-- 混发组筛选（移动到日期筛选的右边） -->
            <div class="arco-input-group mixture-release-filter-group" size="small">
              <span class="arco-input-wrapper arco-input-disabled search-group-input" style="width: 4em;">
                <input class="arco-input arco-input-size-small" type="text" disabled value="混发组">
              </span>
              <a-select
                  v-model="selectedMixtureRelease"
                  :options="mixtureReleaseOptions"
                  placeholder="请选择混发组"
                  style="width: 160px"
                  size="small"
                  allow-clear
                  :loading="mixtureReleaseLoading"
                  @dropdown-visible-change="handleMixtureReleaseDropdownVisible"
              />
            </div>
          </div>
        </div>
      </a-card>

      <!-- 表格部分 -->
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
            <a-dropdown-button>
              操作
              <template #overlay>
                <a-menu @select="onActionSelect">
                  <a-menu-item key="view">查看</a-menu-item>
                  <a-menu-item key="edit">编辑</a-menu-item>
                </a-menu>
              </template>
            </a-dropdown-button>
          </template>
        </a-table>
      </a-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from "vue";
import {
  getApprovalProductStats,
  getApprovalProductList,
  getCountryList,
  getSupplierList,
  getUserList,
  getBrandList,
  getMixtureReleaseList,
  type Supplier,
  type User,
  type Brand,
  type MixtureRelease
} from "@/api/approvalProduct";
import { IconDown } from '@arco-design/web-vue/es/icon';
import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';
dayjs.extend(isBetween);

/* ========== 类型定义 ========== */
interface CategoryNode {
  label: string;
  value: string;
  key: string;
  level: number;
  isLeaf?: boolean;
  children?: CategoryNode[];
  leafIds?: string[]; // 存储该节点下所有叶子节点的ID
}

interface CountryOption {
  label: string;
  value: string;
}

interface FilterOption {
  label: string;
  value: string;
}

interface SupplierOption {
  label: string;
  value: string;
  rawSupplier: Supplier;
}

interface UserOption {
  label: string;
  value: string;
  rawUser: User;
}

interface BrandOption {
  label: string;
  value: string;
  rawBrand: Brand;
}

interface MixtureReleaseOption {
  label: string;
  value: string;
  rawMixtureRelease: MixtureRelease;
}

/* ========== 展开状态控制 ========== */
const isExpanded = ref(false); // 控制更多筛选条件的展开状态

/* ========== 状态 ========== */
const mode = ref<'SKU' | 'SPU'>('SKU'); // 外层模式（控制接口/列/下拉首项）
const loading = ref(true);
const error = ref(false);

const data1 = ref<{
  total: number;
  pending: number;
  done: number;
  rejected: number;
  draft: number;
  cancellation: number;
} | null>(null);

const allListData = ref<any[]>([]); // 存储所有数据
const activeTab = ref(""); // tab key

/* ========== 筛选相关状态 ========== */
const searchType = ref<'模糊查询'|'精确查询'>('模糊查询');
const searchValue = ref('');
const filterField = ref<'SKU' | 'SPU' | 'productName' | 'approveNo'>(mode.value);
const selectedCountry = ref<string>(''); // 选中的国家（单选）
const selectedApprovalType = ref<string>(''); // 选中的审批类型（单选）
const selectedCategory = ref<string>(''); // 选中的分类（单选）
const selectedSupplier = ref<string>(''); // 选中的供应商（单选）
const selectedUser = ref<string>(''); // 选中的用户（创建人）（单选）
const selectedBrand = ref<string>(''); // 选中的品牌（单选）
const selectedMixtureRelease = ref<string>(''); // 选中的混发组（单选）
const selectedDateType = ref<'createTime' | 'endTime'>('createTime'); // 日期筛选类型
const dateRange = ref<string[]>([]); // 日期范围
const countryOptions = ref<CountryOption[]>([]); // 国家选项
const countryLoading = ref(false); // 国家数据加载状态
const supplierOptions = ref<SupplierOption[]>([]); // 供应商选项
const supplierLoading = ref(false); // 供应商数据加载状态
const userOptions = ref<UserOption[]>([]); // 用户选项
const userLoading = ref(false); // 用户数据加载状态
const brandOptions = ref<BrandOption[]>([]); // 品牌选项
const brandLoading = ref(false); // 品牌数据加载状态
const mixtureReleaseOptions = ref<MixtureReleaseOption[]>([]); // 混发组选项
const mixtureReleaseLoading = ref(false); // 混发组数据加载状态
const categoryTree = ref<CategoryNode[]>([]); // 分类树形数据
const categoryLoading = ref(false); // 分类数据加载状态
const categoryLeafIdMap = ref<Map<string, string[]>>(new Map()); // 存储节点ID到叶子节点ID列表的映射

// 审批类型选项
const approvalTypeOptions = ref<FilterOption[]>([
  { label: '新品', value: '新品' },
  { label: '老品变更', value: '老品变更' },
  { label: '迭代品', value: '迭代品' }
]);

// 查询方式选项
const searchTypeOptions: FilterOption[] = [
  { label: '模糊查询', value: '模糊查询' },
  { label: '精确查询', value: '精确查询' }
];

// 筛选字段选项
const filterOptions = computed<FilterOption[]>(() => {
  const baseOptions = [
    { label: '品名', value: 'productName' },
    { label: '单据编号', value: 'approveNo' }
  ];

  // 根据当前模式添加对应的选项
  if (mode.value === 'SKU') {
    return [{ label: 'SKU', value: 'SKU' }, ...baseOptions];
  } else {
    return [{ label: 'SPU', value: 'SPU' }, ...baseOptions];
  }
});

/* ========== 列定义 ========== */
const skuColumns = [
  { title: '单据编号', dataIndex: 'approveNo', width: 120, fixed: 'left' },
  { title: 'SKU', dataIndex: 'sku', width: 100, fixed: 'left' },
  { title: '品名', dataIndex: 'productName', width: 150 },
  { title: '13位编码', dataIndex: 'thirteenBitCode', width: 130 },
  { title: '工厂型号', dataIndex: 'factoryModel', width: 120 },
  { title: '国家', slotName: 'country', width: 90 },
  { title: '分类', slotName: 'category', width: 200 },
  { title: '审批类型', dataIndex: 'approvalFlow', render: (r: any) => r.approvalFlow?.flowType || '-', width: 100 },
  { title: '状态', dataIndex: 'approveStatus', width: 100 },
  { title: '当前节点', dataIndex: 'approvalFlow', render: (r: any) => r.approvalFlow?.currentNode?.nameDisplay || '-', width: 120 },
  { title: '处理人', slotName: 'nodeUser', width: 120 },
  { title: '原始SKU', dataIndex: 'associationProductNo', render: (r: any) => r.associationProductNo?.sku || '-', width: 100 },
  { title: '备注', dataIndex: 'remark', width: 120 },
  { title: '创建人', dataIndex: 'creator', render: (r: any) => r.creator?.name || '-', width: 100 },
  { title: '创建时间', dataIndex: 'createTime', width: 160 },
  { title: '更新人', dataIndex: 'updateUser', render: (r: any) => r.updateUser?.name || '-', width: 100 },
  { title: '更新时间', dataIndex: 'modifyTime', width: 160 },
  { title: '操作', slotName: 'actions', width: 120, fixed: 'right' }
];

const spuColumns = [
  { title: '单据编号', dataIndex: 'approveNo', width: 120, fixed: 'left' },
  { title: 'SPU', dataIndex: 'spu', width: 100, fixed: 'left' },
  { title: '品名', dataIndex: 'productName', width: 150 },
  { title: 'SKU', dataIndex: 'sku', width: 120 },
  { title: '工厂型号', dataIndex: 'factoryModel', width: 120 },
  { title: '国家', slotName: 'country', width: 90 },
  { title: '分类', slotName: 'category', width: 200 },
  { title: '审批类型', render: (r: any) => r.approvalFlow?.flowType || '-', width: 100 },
  { title: '状态', dataIndex: 'approveStatus', width: 100 },
  { title: '当前节点', render: (r: any) => r.approvalFlow?.currentNode?.nameDisplay || '-', width: 120 },
  { title: '处理人', slotName: 'nodeUser', width: 120 },
  { title: '原始SPU', render: (r: any) => r.associationProductNo?.spu || '-', width: 120 },
  { title: '备注', dataIndex: 'remark', width: 120 },
  { title: '创建人', render: (r: any) => r.creator?.name || '-', width: 100 },
  { title: '创建时间', dataIndex: 'createTime', width: 160 },
  { title: '更新人', render: (r: any) => r.updateUser?.name || '-', width: 100 },
  { title: '更新时间', dataIndex: 'modifyTime', width: 160 },
  { title: '操作', slotName: 'actions', width: 120, fixed: 'right' }
];

const columns = computed(() => (mode.value === 'SKU' ? skuColumns : spuColumns));

/* ========== 列表 / 过滤 / tabs ========== */
// 计算属性：根据tab状态、搜索条件、国家、审批类型和供应商筛选过滤数据
const filteredListData = computed(() => {
  let filteredData = allListData.value;

  // 1. 先按tab状态过滤
  if (activeTab.value) {
    filteredData = filteredData.filter(item => item.approveStatus === activeTab.value);
  }

  // 2. 搜索条件过滤
  if (searchValue.value.trim()) {
    filteredData = filteredData.filter(item => {
      const fieldValue = getFieldValue(item, filterField.value);
      if (!fieldValue) return false;

      if (searchType.value === '精确查询') {
        return fieldValue.toString().toLowerCase() === searchValue.value.toLowerCase().trim();
      } else {
        return fieldValue.toString().toLowerCase().includes(searchValue.value.toLowerCase().trim());
      }
    });
  }

  // 3. 国家筛选
  if (selectedCountry.value) {
    filteredData = filteredData.filter(item => {
      const itemCountries = item.countryList || [];
      return itemCountries.some((country: any) => country.name === selectedCountry.value);
    });
  }

  // 4. 审批类型筛选
  if (selectedApprovalType.value) {
    filteredData = filteredData.filter(item => {
      const approvalType = item.approvalFlow?.flowType || '';
      return approvalType === selectedApprovalType.value;
    });
  }

  // 5. 分类筛选 - 修复：支持一级、二级、三级分类筛选
  if (selectedCategory.value) {
    const leafIds = categoryLeafIdMap.value.get(selectedCategory.value);
    if (leafIds && leafIds.length > 0) {
      // 如果是非叶子节点，使用其下的所有叶子节点ID进行筛选
      filteredData = filteredData.filter(item => {
        const productCategoryId = item.productClass?.id;
        return productCategoryId && leafIds.includes(productCategoryId);
      });
    } else {
      // 如果是叶子节点，直接匹配ID
      filteredData = filteredData.filter(item => {
        const productCategoryId = item.productClass?.id;
        return productCategoryId && productCategoryId === selectedCategory.value;
      });
    }
  }

  // 6. 供应商筛选 - 需要根据实际数据结构调整
  if (selectedSupplier.value) {
    // 根据实际数据结构来筛选供应商
    const selectedOption = supplierOptions.value.find(opt => opt.value === selectedSupplier.value);

    if (selectedOption) {
      const selectedSupplierObj = selectedOption.rawSupplier;
      // 这里需要根据你的实际数据结构来筛选
      // 示例：根据供应商ID筛选
      return filteredData.filter(item => {
        // 根据实际数据结构调整
        // 假设数据中有 supplierId 或 supplierName 字段
        return item.supplierId === selectedSupplierObj.id;
      });
    }
  }

  // 7. 用户筛选（创建人）
  if (selectedUser.value) {
    // 根据实际数据结构来筛选创建人
    const selectedOption = userOptions.value.find(opt => opt.value === selectedUser.value);

    if (selectedOption) {
      const selectedUserObj = selectedOption.rawUser;
      // 根据创建人ID筛选
      filteredData = filteredData.filter(item => {
        const creatorId = item.creator?.id;
        return creatorId && creatorId === selectedUserObj.id;
      });
    }
  }

  // 8. 品牌筛选
  if (selectedBrand.value) {
    // 根据实际数据结构来筛选品牌
    const selectedOption = brandOptions.value.find(opt => opt.value === selectedBrand.value);

    if (selectedOption) {
      const selectedBrandObj = selectedOption.rawBrand;
      // 根据品牌ID筛选
      filteredData = filteredData.filter(item => {
        const brandId = item.brand?.id;
        return brandId && brandId === selectedBrandObj.id;
      });
    }
  }

  // 9. 混发组筛选
  if (selectedMixtureRelease.value) {
    // 根据实际数据结构来筛选混发组
    const selectedOption = mixtureReleaseOptions.value.find(opt => opt.value === selectedMixtureRelease.value);

    if (selectedOption) {
      const selectedMixtureReleaseObj = selectedOption.rawMixtureRelease;
      // 根据混发组ID筛选
      filteredData = filteredData.filter(item => {
        // 这里需要根据你的实际数据结构调整
        // 假设数据中有 mixtureReleaseId 字段
        const mixtureReleaseId = item.mixtureRelease?.id || item.mixtureReleaseId;
        return mixtureReleaseId && mixtureReleaseId === selectedMixtureReleaseObj.id;
      });
    }
  }

  // 10. 日期范围筛选
  if (dateRange.value && dateRange.value.length === 2) {
    const [startDate, endDate] = dateRange.value;

    if (startDate && endDate) {
      const start = dayjs(startDate).startOf('day');
      const end = dayjs(endDate).endOf('day');

      filteredData = filteredData.filter(item => {
        let dateValue = '';

        if (selectedDateType.value === 'createTime') {
          // 筛选创建时间
          dateValue = item.createTime;
        } else if (selectedDateType.value === 'endTime') {
          // 筛选完成时间（使用approvalFlow的endTime）
          dateValue = item.approvalFlow?.endTime;
        }

        // 如果日期值为空，则不包含在筛选结果中
        if (!dateValue) return false;

        const itemDate = dayjs(dateValue);
        return itemDate.isBetween(start, end, null, '[]'); // [] 表示包含边界
      });
    }
  }

  return filteredData;
});

// 辅助函数：根据字段名获取对应的值
const getFieldValue = (item: any, field: string) => {
  switch (field) {
    case 'SKU':
      return item.sku;
    case 'SPU':
      return item.spu;
    case 'productName':
      return item.productName;
    case 'approveNo':
      return item.approveNo;
    default:
      return null;
  }
};

const tabList = computed(() => {
  if (!data1.value) return [];
  return [
    { label: "全部", value: "", count: data1.value.total },
    { label: "待提交", value: "DRAFT", count: data1.value.draft },
    { label: "审批中", value: "PENDING", count: data1.value.pending },
    { label: "已完成", value: "DONE", count: data1.value.done },
    { label: "已驳回", value: "REJECTED", count: data1.value.rejected },
    { label: "已作废", value: "CANCELLATION", count: data1.value.cancellation }
  ];
});

/* ========== 日期筛选相关方法 ========== */
// 处理日期类型选择
const handleDateTypeSelect = (value: 'createTime' | 'endTime') => {
  selectedDateType.value = value;
  console.log('选择的日期类型:', value);
};

// 处理日期范围变化
const handleDateRangeChange = (value: string[]) => {
  dateRange.value = value;
  console.log('选择的日期范围:', value);
};

// 处理日期范围清除
const handleDateRangeClear = () => {
  dateRange.value = [];
  console.log('已清除日期范围');
};

/* ========== 混发组筛选方法 ========== */
// 加载混发组列表的函数
const loadMixtureReleases = async () => {
  // 如果已经加载过且数据不为空，就不再重复加载
  if (mixtureReleaseOptions.value.length > 0 && !mixtureReleaseLoading.value) {
    console.log('混发组数据已加载，跳过重复加载');
    return mixtureReleaseOptions.value;
  }

  try {
    console.log('开始加载混发组数据...');
    mixtureReleaseLoading.value = true;

    // 调用接口获取数据
    const list = await getMixtureReleaseList();
    console.log("混发组接口返回：", list);

    // 检查返回的数据类型
    if (!Array.isArray(list)) {
      console.error('混发组数据不是数组格式:', typeof list, list);
      mixtureReleaseOptions.value = [];
      return [];
    }

    console.log('混发组数量:', list.length);

    // 处理真实数据
    const options = list.map(release => {
      const name = release.releaseName || release.releaseEnglishName || '未命名混发组';

      return {
        label: name,
        value: release.id,
        rawMixtureRelease: release
      };
    });

    console.log('处理后的混发组选项:', options);
    mixtureReleaseOptions.value = options;

    return options;
  } catch (error) {
    console.error('加载混发组列表失败:', error);
    const err = error as any;
    console.error('错误详情:', err?.message ?? err);

    mixtureReleaseOptions.value = [];
    return [];
  } finally {
    mixtureReleaseLoading.value = false;
  }
};

// 混发组下拉框显示/隐藏事件处理
const handleMixtureReleaseDropdownVisible = (visible: boolean) => {
  console.log('混发组下拉框状态:', visible, '当前选项数:', mixtureReleaseOptions.value.length);

  if (visible) {
    // 当下拉框打开时，确保数据已加载
    if (mixtureReleaseOptions.value.length === 0 && !mixtureReleaseLoading.value) {
      console.log('下拉框打开，开始加载混发组数据...');
      loadMixtureReleases();
    } else {
      console.log('混发组数据已存在，无需加载');
    }
  }
};

/* ========== 分类筛选方法 ========== */
// 递归收集节点的所有叶子节点ID
const collectLeafIds = (node: CategoryNode): string[] => {
  if (!node.children || node.children.length === 0) {
    // 叶子节点
    return [node.value];
  }

  let leafIds: string[] = [];
  node.children.forEach(child => {
    leafIds = leafIds.concat(collectLeafIds(child));
  });
  return leafIds;
};

// 从产品数据中构建分类树
const buildCategoryTreeFromData = () => {
  categoryLoading.value = true;
  try {
    // 使用Map来存储所有分类节点，key为ID，value为节点信息
    const allNodesMap = new Map<string, CategoryNode>();
    const nodeParentMap = new Map<string, string>(); // 存储节点的父节点ID

    // 遍历所有产品数据，提取分类信息
    allListData.value.forEach(product => {
      const productClass = product.productClass;
      if (!productClass) return;

      // 三级分类（当前分类）
      const level3Id = productClass.id;
      if (level3Id && !allNodesMap.has(level3Id)) {
        allNodesMap.set(level3Id, {
          label: productClass.categoryName || '未命名',
          value: level3Id,
          key: level3Id,
          level: 3,
          isLeaf: true
        });
      }

      // 记录三级分类的父节点（二级分类）
      const level2 = productClass.parent;
      if (level2?.id) {
        nodeParentMap.set(level3Id, level2.id);

        // 添加二级分类节点
        if (!allNodesMap.has(level2.id)) {
          allNodesMap.set(level2.id, {
            label: level2.categoryName || '未命名',
            value: level2.id,
            key: level2.id,
            level: 2
          });
        }

        // 记录二级分类的父节点（一级分类）
        const level1 = level2.parent;
        if (level1?.id) {
          nodeParentMap.set(level2.id, level1.id);

          // 添加一级分类节点
          if (!allNodesMap.has(level1.id)) {
            allNodesMap.set(level1.id, {
              label: level1.categoryName || '未命名',
              value: level1.id,
              key: level1.id,
              level: 1
            });
          }
        }
      }
    });

    // 构建树形结构
    const tree: CategoryNode[] = [];

    // 先收集所有节点
    const allNodes = Array.from(allNodesMap.values());

    // 为每个节点添加children数组
    allNodes.forEach(node => {
      if (node.level < 3) { // 一级和二级分类可能有子节点
        node.children = [];
      }
    });

    // 根据父节点映射构建树形结构
    allNodes.forEach(node => {
      const parentId = nodeParentMap.get(node.value);

      if (parentId) {
        // 找到父节点
        const parentNode = allNodes.find(n => n.value === parentId);
        if (parentNode && parentNode.children) {
          parentNode.children.push(node);
        }
      } else {
        // 没有父节点，说明是根节点（一级分类）
        tree.push(node);
      }
    });

    // 按层级和标签排序
    const sortNodes = (nodes: CategoryNode[]): CategoryNode[] => {
      return nodes.sort((a, b) => {
        // 先按层级
        if (a.level !== b.level) {
          return a.level - b.level;
        }
        // 再按标签
        return (a.label || '').localeCompare(b.label || '');
      });
    };

    // 排序根节点
    sortNodes(tree);

    // 递归排序子节点
    const sortChildrenRecursive = (nodes: CategoryNode[]) => {
      nodes.forEach(node => {
        if (node.children && node.children.length > 0) {
          node.children = sortNodes(node.children);
          sortChildrenRecursive(node.children);
        }
      });
    };

    sortChildrenRecursive(tree);

    // 构建叶子节点ID映射
    const leafIdMap = new Map<string, string[]>();

    const buildLeafIdMap = (nodes: CategoryNode[]) => {
      nodes.forEach(node => {
        const leafIds = collectLeafIds(node);
        leafIdMap.set(node.value, leafIds);

        // 递归处理子节点
        if (node.children && node.children.length > 0) {
          buildLeafIdMap(node.children);
        }
      });
    };

    buildLeafIdMap(tree);
    categoryLeafIdMap.value = leafIdMap;
    categoryTree.value = tree;

    console.log('构建的分类树:', tree);
    console.log('叶子节点映射:', leafIdMap);

  } catch (error) {
    console.error('构建分类树失败:', error);
    categoryTree.value = [];
    categoryLeafIdMap.value = new Map();
  } finally {
    categoryLoading.value = false;
  }
};

// 分类选择变化处理
const handleCategoryChange = (value: string) => {
  selectedCategory.value = value;
  console.log('选择的分类ID:', value);
  console.log('对应的叶子节点ID:', categoryLeafIdMap.value.get(value));
};

// 监听列表数据变化，构建分类树
watch(
    () => allListData.value,
    (newList) => {
      if (newList && newList.length > 0) {
        buildCategoryTreeFromData();
      }
    },
    { immediate: true }
);

/* ========== 供应商筛选方法 ========== */
// 加载供应商列表的函数
const loadSuppliers = async () => {
  // 如果已经加载过且数据不为空，就不再重复加载
  if (supplierOptions.value.length > 0 && !supplierLoading.value) {
    console.log('供应商数据已加载，跳过重复加载');
    return supplierOptions.value;
  }

  try {
    console.log('开始加载供应商数据...');
    supplierLoading.value = true;

    // 调用接口获取数据
    const list = await getSupplierList();
    console.log("供应商接口返回：", list);

    // 检查返回的数据类型
    if (!Array.isArray(list)) {
      console.error('供应商数据不是数组格式:', typeof list, list);
      supplierOptions.value = [];
      return [];
    }

    console.log('供应商数量:', list.length);

    // 处理真实数据
    const options = list.map(supplier => {
      const code = supplier.code || '';
      const name = supplier.name || supplier.englishName || '未命名';
      const displayName = code ? `${code}-${name}` : name;

      return {
        label: displayName,
        value: supplier.id,
        rawSupplier: supplier
      };
    });

    console.log('处理后的供应商选项:', options);
    supplierOptions.value = options;

    return options;
  } catch (error) {
    console.error('加载供应商列表失败:', error);
    const err = error as any;
    console.error('错误详情:', err?.message ?? err);

    supplierOptions.value = [];
    return [];
  } finally {
    supplierLoading.value = false;
  }
};

// 供应商下拉框显示/隐藏事件处理
const handleSupplierDropdownVisible = (visible: boolean) => {
  console.log('供应商下拉框状态:', visible, '当前选项数:', supplierOptions.value.length);

  if (visible) {
    // 当下拉框打开时，确保数据已加载
    if (supplierOptions.value.length === 0 && !supplierLoading.value) {
      console.log('下拉框打开，开始加载供应商数据...');
      loadSuppliers();
    } else {
      console.log('供应商数据已存在，无需加载');
    }
  }
};

/* ========== 用户筛选方法 ========== */
// 加载用户列表的函数
const loadUsers = async () => {
  // 如果已经加载过且数据不为空，就不再重复加载
  if (userOptions.value.length > 0 && !userLoading.value) {
    console.log('用户数据已加载，跳过重复加载');
    return userOptions.value;
  }

  try {
    console.log('开始加载用户数据...');
    userLoading.value = true;

    // 调用接口获取数据
    const list = await getUserList();
    console.log("用户接口返回：", list);

    // 检查返回的数据类型
    if (!Array.isArray(list)) {
      console.error('用户数据不是数组格式:', typeof list, list);
      userOptions.value = [];
      return [];
    }

    console.log('用户数量:', list.length);

    // 处理真实数据
    const options = list.map(user => {
      const name = user.name || user.alias || user.userName || '未命名';

      return {
        label: name,
        value: user.id,
        rawUser: user
      };
    });

    console.log('处理后的用户选项:', options);
    userOptions.value = options;

    return options;
  } catch (error) {
    console.error('加载用户列表失败:', error);
    const err = error as any;
    console.error('错误详情:', err?.message ?? err);

    userOptions.value = [];
    return [];
  } finally {
    userLoading.value = false;
  }
};

// 用户下拉框显示/隐藏事件处理
const handleUserDropdownVisible = (visible: boolean) => {
  console.log('用户下拉框状态:', visible, '当前选项数:', userOptions.value.length);

  if (visible) {
    // 当下拉框打开时，确保数据已加载
    if (userOptions.value.length === 0 && !userLoading.value) {
      console.log('下拉框打开，开始加载用户数据...');
      loadUsers();
    } else {
      console.log('用户数据已存在，无需加载');
    }
  }
};

/* ========== 品牌筛选方法 ========== */
// 加载品牌列表的函数
const loadBrands = async () => {
  // 如果已经加载过且数据不为空，就不再重复加载
  if (brandOptions.value.length > 0 && !brandLoading.value) {
    console.log('品牌数据已加载，跳过重复加载');
    return brandOptions.value;
  }

  try {
    console.log('开始加载品牌数据...');
    brandLoading.value = true;

    // 调用接口获取数据
    const list = await getBrandList();
    console.log("品牌接口返回：", list);

    // 检查返回的数据类型
    if (!Array.isArray(list)) {
      console.error('品牌数据不是数组格式:', typeof list, list);
      brandOptions.value = [];
      return [];
    }

    console.log('品牌数量:', list.length);

    // 处理真实数据
    const options = list.map(brand => {
      const name = brand.brandName || '未命名品牌';

      return {
        label: name,
        value: brand.id,
        rawBrand: brand
      };
    });

    console.log('处理后的品牌选项:', options);
    brandOptions.value = options;

    return options;
  } catch (error) {
    console.error('加载品牌列表失败:', error);
    const err = error as any;
    console.error('错误详情:', err?.message ?? err);

    brandOptions.value = [];
    return [];
  } finally {
    brandLoading.value = false;
  }
};

// 品牌下拉框显示/隐藏事件处理
const handleBrandDropdownVisible = (visible: boolean) => {
  console.log('品牌下拉框状态:', visible, '当前选项数:', brandOptions.value.length);

  if (visible) {
    // 当下拉框打开时，确保数据已加载
    if (brandOptions.value.length === 0 && !brandLoading.value) {
      console.log('下拉框打开，开始加载品牌数据...');
      loadBrands();
    } else {
      console.log('品牌数据已存在，无需加载');
    }
  }
};

/* ========== 展开/收起方法 ========== */
const toggleExpand = () => {
  const newExpandedState = !isExpanded.value;
  isExpanded.value = newExpandedState;

  // 当展开时，自动加载供应商、用户、品牌和混发组数据
  if (newExpandedState) {
    if (supplierOptions.value.length === 0 && !supplierLoading.value) {
      console.log('展开高级筛选，自动加载供应商数据');
      loadSuppliers();
    }
    if (userOptions.value.length === 0 && !userLoading.value) {
      console.log('展开高级筛选，自动加载用户数据');
      loadUsers();
    }
    if (brandOptions.value.length === 0 && !brandLoading.value) {
      console.log('展开高级筛选，自动加载品牌数据');
      loadBrands();
    }
    if (mixtureReleaseOptions.value.length === 0 && !mixtureReleaseLoading.value) {
      console.log('展开高级筛选，自动加载混发组数据');
      loadMixtureReleases();
    }
  }
};

// 加载国家列表的函数
const loadCountries = async () => {
  try {
    countryLoading.value = true;
    const countries = await getCountryList();
    console.log('获取到的国家列表:', countries);

    // 转换为选择框选项格式
    countryOptions.value = countries.map(country => ({
      label: country.nameDisplay || country.name,
      value: country.name
    }));

    return countryOptions.value;
  } catch (error) {
    console.error('加载国家列表失败:', error);
    // 提供默认选项
    countryOptions.value = [
      { label: '中国', value: 'China' },
      { label: '美国', value: 'USA' },
      { label: '日本', value: 'Japan' },
      { label: '韩国', value: 'Korea' }
    ];
    return countryOptions.value;
  } finally {
    countryLoading.value = false;
  }
};

/* ========== onMounted 初始化（并行加载） ========== */
onMounted(async () => {
  try {
    loading.value = true;
    // 初始时 filterField 跟随 mode
    filterField.value = mode.value as any;

    // 并行加载统计数据、列表数据和国家数据
    const [statsRes, listRes] = await Promise.all([
      getApprovalProductStats(mode.value),
      getApprovalProductList(mode.value),
    ]);

    // 并行加载国家、供应商、用户、品牌和混发组数据
    await Promise.all([
      loadCountries(),
      loadSuppliers(),      // 在初始化时就加载供应商数据
      loadUsers(),          // 在初始化时就加载用户数据
      loadBrands(),         // 在初始化时就加载品牌数据
      loadMixtureReleases() // 在初始化时就加载混发组数据
    ]);

    data1.value = statsRes;
    allListData.value = listRes?.searchApprovalProduct?.list || listRes?.data?.searchApprovalProduct?.list || [];
  } catch (e) {
    console.error('初始化加载失败', e);
    error.value = true;
  } finally {
    loading.value = false;
  }
});

/* ========== 切换 mode（左侧按钮） ========== */
const setMode = async (m: 'SKU' | 'SPU') => {
  if (mode.value === m) return;
  mode.value = m;
  // 切换 mode 时重置筛选字段为当前 mode
  filterField.value = m as any;
  // 清空搜索条件
  searchValue.value = '';
  // 清空国家筛选
  selectedCountry.value = '';
  // 清空审批类型筛选
  selectedApprovalType.value = '';
  // 清空分类筛选
  selectedCategory.value = '';
  // 清空供应商筛选
  selectedSupplier.value = '';
  // 清空用户筛选
  selectedUser.value = '';
  // 清空品牌筛选
  selectedBrand.value = '';
  // 清空混发组筛选
  selectedMixtureRelease.value = '';
  // 清空日期筛选
  selectedDateType.value = 'createTime';
  dateRange.value = [];

  try {
    loading.value = true;
    const [statsRes, listRes] = await Promise.all([getApprovalProductStats(mode.value), getApprovalProductList(mode.value)]);
    data1.value = statsRes;
    allListData.value = listRes?.searchApprovalProduct?.list || listRes?.data?.searchApprovalProduct?.list || [];

    // 切换模式时重新加载供应商、用户、品牌和混发组数据
    await Promise.all([
      loadSuppliers(),
      loadUsers(),
      loadBrands(),
      loadMixtureReleases()
    ]);
  } catch (e) {
    console.error('切换模式加载失败', e);
    error.value = true;
  } finally {
    loading.value = false;
  }
};

/* ========== 筛选相关 ========== */
// 应用筛选：前端过滤，不需要重新加载数据
const applyFilter = () => {
  console.log('搜索条件：', {
    查询方式: searchType.value,
    搜索内容: searchValue.value,
    筛选字段: filterField.value,
    选中国家: selectedCountry.value,
    审批类型: selectedApprovalType.value,
    分类: selectedCategory.value,
    供应商: selectedSupplier.value,
    创建人: selectedUser.value,
    品牌: selectedBrand.value,
    混发组: selectedMixtureRelease.value,
    日期类型: selectedDateType.value,
    日期范围: dateRange.value
  });
  // 这里不需要重新加载数据，因为 filteredListData 计算属性会自动更新
  // filteredListData 会根据搜索条件自动过滤数据
};

// 重置筛选条件
const resetFilter = () => {
  searchValue.value = '';
  selectedCountry.value = '';
  selectedApprovalType.value = '';
  selectedCategory.value = '';
  selectedSupplier.value = '';
  selectedUser.value = '';
  selectedBrand.value = '';
  selectedMixtureRelease.value = '';
  selectedDateType.value = 'createTime';
  dateRange.value = [];
  // 重置后，filteredListData 会自动显示所有数据
};

/* 操作列下拉的选择 */
const onActionSelect = (key: string) => {
  console.log('操作选择:', key);
};

/* ========== 行选择 ========== */
const rowSelection = {
  type: 'checkbox',
  showCheckedAll: true,
  onlyCurrent: false
};
</script>

<style scoped>
.approvalProductData {
  color: black;
}

.test1 {
  margin: -10px 0;
}

/* 控制栏整体样式 */
.control-bar {
  display: flex;
  gap: 8px;
  align-items: stretch; /* 让子元素高度拉伸一致 */
  margin-bottom: 12px;
  min-height: 32px; /* 最小高度确保一致性 */
}

/* 按钮组包装器 - 确保与其他控件高度对齐 */
.button-group-wrapper {
  display: flex;
  align-items: center;
  height: 32px; /* 与筛选控件高度一致 */
  flex-shrink: 0;
}

/* 筛选容器样式 */
.filter-container {
  display: flex;
  flex: 1;
  justify-content: space-between;
  align-items: stretch; /* 让内部元素高度拉伸一致 */
  gap: 12px;
  width: 100%;
  min-height: 32px;
}

/* 筛选组样式 */
.filter-group {
  display: flex;
  gap: 6px;
  align-items: center;
  flex-wrap: nowrap;
  overflow-x: auto;
  padding-bottom: 4px;
  flex: 1;
  min-height: 32px;
}

/* 确保筛选组内所有控件基线统一 */
.filter-group > *,
.filter-group .arco-select,
.filter-group .arco-input-wrapper,
.filter-group .arco-tree-select-view,
.filter-group .arco-input-group {
  display: flex;
  align-items: center;
  height: 32px;
  box-sizing: border-box;
}

/* 筛选控件统一高度 */
.filter-group .arco-select-view,
.filter-group .arco-input-wrapper,
.filter-group .arco-tree-select-view {
  height: 32px;
  min-height: 32px !important;
}

.filter-group .arco-select-view-inner,
.filter-group .arco-input-inner,
.filter-group .arco-tree-select-view-inner {
  display: flex;
  align-items: center;
  height: 100%;
}

/* 输入框组统一高度 */
.arco-input-group {
  height: 32px;
  min-height: 32px;
}

.arco-input-group .arco-input-wrapper,
.arco-input-group .arco-select-view {
  height: 32px;
  min-height: 32px;
}

/* 按钮组样式 - 靠在右侧 */
.filter-buttons {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
  margin-left: auto;
  height: 32px;
}

/* 切换按钮样式 - 确保基线对齐 */
.switch-btn {
  border-radius: 0;
  background: #fff;
  border-color: #e5e6eb ;
  color: #4e5992 ;
  padding: 0 12px !important;
  height: 32px !important;
  line-height: 30px !important;
  font-size: 13px;
  box-shadow: none ;
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  vertical-align: middle;
}

.switch-btn.active,
.switch-btn[aria-pressed="true"] {
  background: #2f54eb ;
  color: #fff ;
  border-color: #2f54eb ;
  box-shadow: none ;
}

.switch-btn.arco-btn-primary,
.switch-btn.arco-btn-primary.active {
  background: #2f54eb;
  color: #fff;
  border-color: #2f54eb;
}

.switch-btn:first-child {
  border-top-left-radius: 6px;
  border-bottom-left-radius: 6px;
}
.switch-btn:last-child {
  border-top-right-radius: 6px;
  border-bottom-right-radius: 6px;
}

.switch-btn:hover {
  background: #fafafa;
}

/* 展开/收起按钮样式 */
.expand-btn {
  transition: all 0.3s ease;
  border-color: #e5e6eb;
  flex-shrink: 0;
  height: 32px;
  padding: 0 8px;
  font-size: 13px;
}

.expand-btn:hover {
  border-color: var(--color-primary-light-hover);
  color: var(--color-primary-light-hover);
}

.expand-btn.expand-btn--expanded {
  border-color: var(--color-primary-light-active);
  color: var(--color-primary-light-active);
}

.expand-icon {
  transition: transform 0.3s ease;
  margin-left: 4px;
  font-size: 12px;
}

.expand-icon.expand-icon--rotated {
  transform: rotate(180deg);
}

/* 高级筛选区域样式 */
.advanced-filters {
  margin-top: 6px;
  margin-bottom: 18px;
  background-color: white;
}

.filter-row {
  display: flex;
  gap: 8px;
  align-items: center;
  flex-wrap: wrap;
}

/* 国家筛选组样式 */
.country-filter-group {
  display: flex;
  align-items: center;
  border-radius: 6px;
  overflow: hidden;
  border: 1px solid var(--color-border);
  flex-shrink: 0;
  height: 32px;
}

.country-filter-group:hover {
  border-color: var(--color-primary-light-hover);
}

.country-filter-group:focus-within {
  border-color: var(--color-primary-light-active);
  box-shadow: 0 0 0 2px var(--color-primary-light-1);
}

/* 审批类型筛选组样式 */
.approval-type-filter-group {
  display: flex;
  align-items: center;
  border-radius: 6px;
  overflow: hidden;
  border: 1px solid var(--color-border);
  flex-shrink: 0;
  height: 32px;
}

.approval-type-filter-group:hover {
  border-color: var(--color-primary-light-hover);
}

.approval-type-filter-group:focus-within {
  border-color: var(--color-primary-light-active);
  box-shadow: 0 0 0 2px var(--color-primary-light-1);
}

/* 分类筛选组样式 */
.category-filter-group {
  display: flex;
  align-items: center;
  border-radius: 6px;
  overflow: hidden;
  border: 1px solid var(--color-border);
  flex-shrink: 0;
  height: 32px;
}

.category-filter-group:hover {
  border-color: var(--color-primary-light-hover);
}

.category-filter-group:focus-within {
  border-color: var(--color-primary-light-active);
  box-shadow: 0 0 0 2px var(--color-primary-light-1);
}

/* 供应商筛选组样式 */
.supplier-filter-group {
  display: flex;
  align-items: center;
  border-radius: 6px;
  overflow: hidden;
  border: 1px solid var(--color-border);
  flex-shrink: 0;
  height: 32px;
}

.supplier-filter-group:hover {
  border-color: var(--color-primary-light-hover);
}

.supplier-filter-group:focus-within {
  border-color: var(--color-primary-light-active);
  box-shadow: 0 0 0 2px var(--color-primary-light-1);
}

/* 用户筛选组样式 */
.user-filter-group {
  display: flex;
  align-items: center;
  border-radius: 6px;
  overflow: hidden;
  border: 1px solid var(--color-border);
  flex-shrink: 0;
  height: 32px;
}

.user-filter-group:hover {
  border-color: var(--color-primary-light-hover);
}

.user-filter-group:focus-within {
  border-color: var(--color-primary-light-active);
  box-shadow: 0 0 0 2px var(--color-primary-light-1);
}

/* 品牌筛选组样式 */
.brand-filter-group {
  display: flex;
  align-items: center;
  border-radius: 6px;
  overflow: hidden;
  border: 1px solid var(--color-border);
  flex-shrink: 0;
  height: 32px;
}

.brand-filter-group:hover {
  border-color: var(--color-primary-light-hover);
}

.brand-filter-group:focus-within {
  border-color: var(--color-primary-light-active);
  box-shadow: 0 0 0 2px var(--color-primary-light-1);
}

/* 混发组筛选组样式 */
.mixture-release-filter-group {
  display: flex;
  align-items: center;
  border-radius: 6px;
  overflow: hidden;
  border: 1px solid var(--color-border);
  flex-shrink: 0;
  height: 32px;
}

.mixture-release-filter-group:hover {
  border-color: var(--color-primary-light-hover);
}

.mixture-release-filter-group:focus-within {
  border-color: var(--color-primary-light-active);
  box-shadow: 0 0 0 2px var(--color-primary-light-1);
}

/* 日期筛选组样式 */
.date-filter-group {
  display: flex;
  align-items: center;
  border-radius: 6px;
  overflow: hidden;
  border: 1px solid var(--color-border);
  flex-shrink: 0;
  height: 32px;
}

.date-filter-group:hover {
  border-color: var(--color-primary-light-hover);
}

.date-filter-group:focus-within {
  border-color: var(--color-primary-light-active);
  box-shadow: 0 0 0 2px var(--color-primary-light-1);
}

/* 日期类型按钮样式 */
.date-type-btn {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 6px;
  background-color: #f7f8fa;
  border: 1px solid #e5e6eb;
  border-right: none;
  border-radius: 6px 0 0 6px;
  height: 32px;
  min-width: 80px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.date-type-btn:hover {
  background-color: #f2f3f5;
  border-color: var(--color-primary-light-hover);
}

.date-type-label {
  font-size: 13px;
  color: #4e5969;
  white-space: nowrap;
}

.date-type-icon {
  color: #4e5969;
  font-size: 12px;
  margin-left: 6px;
  transition: transform 0.3s ease;
}

.date-filter-group .arco-dropdown-open .date-type-icon {
  transform: rotate(180deg);
}

/* 标签样式 */
.search-group-input {
  background-color: #f7f8fa;
  border: none;
  border-radius: 0;
  color: #4e5969;
  font-size: 13px;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 32px;
  flex-shrink: 0;
}

.search-group-input .arco-input {
  text-align: center;
  background: transparent;
  border: none;
  color: #4e5969;
  font-size: 13px;
}

/* 选择框样式调整 */
.country-filter-group .arco-select,
.approval-type-filter-group .arco-select,
.category-filter-group .arco-select,
.category-filter-group .arco-tree-select,
.supplier-filter-group .arco-select,
.user-filter-group .arco-select,
.brand-filter-group .arco-select,
.mixture-release-filter-group .arco-select {
  border: none;
  border-radius: 0;
  box-shadow: none;
}

.country-filter-group .arco-select-view,
.approval-type-filter-group .arco-select-view,
.category-filter-group .arco-select-view,
.category-filter-group .arco-tree-select-view,
.supplier-filter-group .arco-select-view,
.user-filter-group .arco-select-view,
.brand-filter-group .arco-select-view,
.mixture-release-filter-group .arco-select-view {
  border: none;
  border-radius: 0;
  box-shadow: none;
  min-height: 32px;
  height: 32px;
}

/* 日期范围选择器样式调整 */
.date-filter-group .arco-picker {
  border-left: none;
  border-radius: 0 6px 6px 0;
  height: 32px;
}

/* 树形选择器下拉框样式调整 */
.category-filter-group :deep(.arco-tree-select-popup) {
  max-height: 350px;
  overflow-y: auto;
}

.category-filter-group :deep(.arco-tree-select-popup .arco-tree-node) {
  padding: 4px 6px;
}

.category-filter-group :deep(.arco-tree-select-popup .arco-tree-node-title) {
  font-size: 13px;
}

/* 确保选择框在聚焦时没有额外的边框 */
.country-filter-group .arco-select-view:focus-within,
.approval-type-filter-group .arco-select-view:focus-within,
.category-filter-group .arco-select-view:focus-within,
.category-filter-group .arco-tree-select-view:focus-within,
.supplier-filter-group .arco-select-view:focus-within,
.user-filter-group .arco-select-view:focus-within,
.brand-filter-group .arco-select-view:focus-within,
.mixture-release-filter-group .arco-select-view:focus-within {
  border: none;
  box-shadow: none;
}

/* 表格设置最小宽度，确保所有列能在一行显示 */
.custom-table {
  width: 100%;
  min-width: 1600px;
}

/* 使用深度选择器穿透scoped样式，表头加粗且不换行 */
.custom-table :deep(.arco-table-th) {
  font-weight: 700;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 13px;
  padding: 8px 4px;

  /* 只在标题行添加列分隔线 */
  border-right: 1px solid #e5e6eb;
}

/* 单元格不换行 */
.custom-table :deep(.arco-table-td) {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 12px;
  padding: 6px 4px;

  /* 内容行不需要列分隔线 */
  border-right: none;
}

/* 最后一列不需要右边框 */
.custom-table :deep(.arco-table-th:last-child) {
  border-right: none;
}

/* 固定列的样式调整 */
.custom-table :deep(.arco-table-col-fixed-left-last) {
  border-right: 2px solid #e5e6eb; /* 固定列右侧加粗分隔线 */
}

.custom-table :deep(.arco-table-col-fixed-right-first) {
  border-left: 2px solid #e5e6eb; /* 固定列左侧加粗分隔线 */
}

/* 表格单元格内容样式 */
.table-cell-content {
  display: block;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 12px;
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
  border-right: 2px solid #e5e6eb;
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

/* 筛选组滚动条样式 */
.filter-group::-webkit-scrollbar {
  height: 4px;
}

.filter-group::-webkit-scrollbar-thumb {
  background-color: #c9cdd4;
  border-radius: 2px;
}

.filter-group::-webkit-scrollbar-track {
  background-color: #f2f3f5;
}

/* 按钮样式调整 */
.arco-btn-sm {
  height: 32px;
  font-size: 13px;
  padding: 0 8px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

/* 输入框样式调整 */
.arco-input-sm {
  height: 32px;
  font-size: 13px;
}

/* 选择器样式调整 */
.arco-select-view-sm {
  min-height: 32px;
  height: 32px;
  font-size: 13px;
}

.arco-select-option {
  font-size: 13px;
  padding: 4px 8px;
}
</style>

<style>
.approvalProductData .arco-card {
  border-top: none;
}

/* 树形选择器全局样式调整 */
.approvalProductData .arco-tree-select-popup .arco-tree-node-indent {
  flex-shrink: 0;
}

.approvalProductData .arco-tree-select-popup .arco-tree-node-title {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 13px;
}

/* 树形选择器下拉框滚动条样式 */
.approvalProductData .arco-tree-select-popup::-webkit-scrollbar {
  width: 6px;
}

.approvalProductData .arco-tree-select-popup::-webkit-scrollbar-thumb {
  background-color: #c9cdd4;
  border-radius: 3px;
}

.approvalProductData .arco-tree-select-popup::-webkit-scrollbar-track {
  background-color: #f2f3f5;
}

/* 日期下拉菜单样式调整 */
.approvalProductData .arco-dropdown-menu {
  padding: 4px 0;
  border: 1px solid #e5e6eb;
  border-radius: 6px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  background-color: white;
}

.approvalProductData .arco-dropdown-option {
  padding: 6px 10px;
  font-size: 13px;
  color: #4e5969;
}

.approvalProductData .arco-dropdown-option:hover {
  background-color: #f7f8fa;
}

.approvalProductData .arco-dropdown-option-active {
  background-color: #f2f3f5;
  color: #2f54eb;
}

/* 日期范围选择器下拉框样式 */
.approvalProductData .arco-picker-panel {
  max-width: 300px;
  border: 1px solid #e5e6eb;
  border-radius: 6px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  font-size: 13px;
}

.approvalProductData .arco-picker-cell-in-view {
  color: #1d2129;
}

.approvalProductData .arco-picker-cell-today {
  color: #2f54eb;
}

.approvalProductData .arco-picker-cell-selected,
.approvalProductData .arco-picker-cell-in-range {
  background-color: #2f54eb;
  color: white;
}

.approvalProductData .arco-picker-cell-in-range::before {
  background-color: rgba(47, 84, 235, 0.1);
}

/* 日期下拉框箭头调整 */
.approvalProductData .arco-dropdown {
  display: block;
}

.approvalProductData .date-filter-group .arco-dropdown-open .date-type-btn {
  border-color: var(--color-primary-light-active);
  background-color: white;
}

.approvalProductData .date-filter-group .arco-dropdown-open .date-type-btn .date-type-label {
  color: #2f54eb;
}

.approvalProductData .date-filter-group .arco-dropdown-open .date-type-btn .date-type-icon {
  color: #2f54eb;
}

/* 调整表格字体大小 */
.approvalProductData .arco-table {
  font-size: 12px;
}

/* 调整卡片内边距 */
.approvalProductData .arco-card-body {
  padding: 12px;
}

/* 调整Tabs样式 */
.approvalProductData .arco-tabs-nav {
  font-size: 13px;
}

.approvalProductData .arco-tabs-tab {
  padding: 8px 12px;
}
</style>