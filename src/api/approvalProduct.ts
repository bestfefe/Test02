import axios from 'axios'

const service = axios.create({
    baseURL: '/api',
    timeout: 5000,
})

service.interceptors.request.use((config) => {
    const token = localStorage.getItem('token')
    if (token) {
        config.headers.Authorization = `Bearer ${token}`
    }
    return config
})

/** REST 接口 */
export const getProductList = async () => {
    try {
        const res = await service.get('approvalProduct/getApprovalProductStatusCount')
        return res.data
    } catch (e) {
        console.error('获取产品列表失败', e)
        return null
    }
}

/** GraphQL 请求封装 */
export const graphqlRequest = async (query: string, variables = {}) => {
    try {
        const res = await service.post('/graphql', {
            query,
            variables,
        })
        if (res.data.errors) {
            // 如果有GraphQL错误，我们可以抛出或者返回一个特定结构
            console.error('GraphQL错误', res.data.errors)
            throw new Error(res.data.errors[0].message || 'GraphQL请求失败')
        }
        return res.data.data   // 返回 data.data
    } catch (e) {
        console.error('GraphQL请求失败', e)
        throw e  // 重新抛出，让调用处处理
    }
}

/** 使用 GraphQL 查询状态计数 */
export const getApprovalProductStats = async () => {
    const query = `
  {
    total: searchApprovalProduct(condition: {
      queries: [
        {values: "SKU", type: "equals", field: "productType"}
      ]
    }) {
      total
    }
    PENDING: searchApprovalProduct(condition: {
      queries: [
        {values: "SKU", type: "equals", field: "productType"},
        {field: "approveStatus", values: "PENDING", type: "equals"}
      ]
    }) {
      total
    }
    DONE: searchApprovalProduct(condition: {
      queries: [
        {values: "SKU", type: "equals", field: "productType"},
        {field: "approveStatus", values: "DONE", type: "equals"}
      ]
    }) {
      total
    }
    REJECTED: searchApprovalProduct(condition: {
      queries: [
        {values: "SKU", type: "equals", field: "productType"},
        {field: "approveStatus", values: "REJECTED", type: "equals"}
      ]
    }) {
      total
    }
    DRAFT: searchApprovalProduct(condition: {
      queries: [
        {values: "SKU", type: "equals", field: "productType"},
        {field: "approveStatus", values: "DRAFT", type: "equals"}
      ]
    }) {
      total
    }
    CANCELLATION: searchApprovalProduct(condition: {
      queries: [
        {values: "SKU", type: "equals", field: "productType"},
        {field: "approveStatus", values: "CANCELLATION", type: "equals"}
      ]
    }) {
      total
    }
  }
  `

    try {
        const result = await graphqlRequest(query)
        console.log('getApprovalProductStats result:', result)
        const data = result.data || result

        // 根据响应结构，数据在 result.data 中
        if (data) {
            return {
                total: parseInt(data.total?.total) || 0,
                pending: parseInt(data.PENDING?.total) || 0,
                done: parseInt(data.DONE?.total) || 0,
                rejected: parseInt(data.REJECTED?.total) || 0,
                draft: parseInt(data.DRAFT?.total) || 0,
                cancellation: parseInt(data.CANCELLATION?.total) || 0
            }
        }

        return null
    } catch (e) {
        console.error('获取审批产品统计失败', e)
        return null
    }
}
export const getApprovalProductList = async () => {
    const query = `
{
  searchApprovalProduct(condition: {
    pageIndex: 1,
    pageSize: 20,
    queries: [
      {values:"SKU", type:"equals", field:"productType"}
    ],
    orders: [{field: "createTime", order: "desc"}]
  }) {
    list {
      remark
      productSkus { productName sku }
      associationProductNo { sku spu }
      id
      approveNo
      productName
      sku
      spu
      mainPictureUrl
      thirteenBitCode
      factoryModel
      demandType
      countryList { name }
      productClass {
        id
        categoryName
        parent {
          id
          categoryName
          parent {
            id
            categoryName
          }
        }
      }
      brand { id brandName }
      approveStatus
      productStatus
      updateUser { name alias }
      creator { name alias }
      createTime
      modifyTime

      approvalFlow {
        canCancel
        approvalIsUrgent
        status
        currentNode {
          id
          name
          nameDisplay
        }
        endTime
      }

      approvalLogs {
        records {
          advice
          processStatus
          processTime
          processUser { name }
          processRecord { name nameDisplay nodeType }
        }
      }
    }
  }
}
  `

    return await graphqlRequest(query)
}