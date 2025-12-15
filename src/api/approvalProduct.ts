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

/** GraphQL 请求封装 */
export const graphqlRequest = async (query: string, variables = {}) => {
    try {
        const res = await service.post('/graphql', {
            query,
            variables,
        })
        if (res.data.errors) {
            console.error('GraphQL错误', res.data.errors)
            throw new Error(res.data.errors[0].message || 'GraphQL请求失败')
        }
        return res.data.data
    } catch (e) {
        console.error('GraphQL请求失败', e)
        throw e
    }
}

/** REST 接口（保留）*/
export const getProductList = async () => {
    try {
        const res = await service.get('approvalProduct/getApprovalProductStatusCount')
        return res.data
    } catch (e) {
        console.error('获取产品列表失败', e)
        return null
    }
}

/** 可传类型的统计接口：type = "SKU" | "SPU" */
export const getApprovalProductStats = async (type: 'SKU' | 'SPU') => {
    const query = `
  {
    total: searchApprovalProduct(condition: {
      queries: [
        {values: "${type}", type: "equals", field: "productType"}
      ]
    }) {
      total
    }
    PENDING: searchApprovalProduct(condition: {
      queries: [
        {values: "${type}", type: "equals", field: "productType"},
        {field: "approveStatus", values: "PENDING", type: "equals"}
      ]
    }) {
      total
    }
    DONE: searchApprovalProduct(condition: {
      queries: [
        {values: "${type}", type: "equals", field: "productType"},
        {field: "approveStatus", values: "DONE", type: "equals"}
      ]
    }) {
      total
    }
    REJECTED: searchApprovalProduct(condition: {
      queries: [
        {values: "${type}", type: "equals", field: "productType"},
        {field: "approveStatus", values: "REJECTED", type: "equals"}
      ]
    }) {
      total
    }
    DRAFT: searchApprovalProduct(condition: {
      queries: [
        {values: "${type}", type: "equals", field: "productType"},
        {field: "approveStatus", values: "DRAFT", type: "equals"}
      ]
    }) {
      total
    }
    CANCELLATION: searchApprovalProduct(condition: {
      queries: [
        {values: "${type}", type: "equals", field: "productType"},
        {field: "approveStatus", values: "CANCELLATION", type: "equals"}
      ]
    }) {
      total
    }
  }
  `

    try {
        const result = await graphqlRequest(query)
        const data = result || {}

        return {
            total: parseInt(data.total?.total) || 0,
            pending: parseInt(data.PENDING?.total) || 0,
            done: parseInt(data.DONE?.total) || 0,
            rejected: parseInt(data.REJECTED?.total) || 0,
            draft: parseInt(data.DRAFT?.total) || 0,
            cancellation: parseInt(data.CANCELLATION?.total) || 0
        }
    } catch (e) {
        console.error('获取审批产品统计失败', e)
        return {
            total: 0,
            pending: 0,
            done: 0,
            rejected: 0,
            draft: 0,
            cancellation: 0
        }
    }
}

/** 可传类型的列表接口：type = "SKU" | "SPU"（pageIndex/pageSize 可后续扩展）*/
export const getApprovalProductList = async (type: 'SKU' | 'SPU', pageIndex = 1, pageSize = 20) => {
    const query = `
{
  searchApprovalProduct(condition: {
    pageIndex: ${pageIndex},
    pageSize: ${pageSize},
    queries: [
      {values:"${type}", type:"equals", field:"productType"}
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
          processUsers {
            processUser { name }
          }
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

/** 国家相关接口 */

// 定义国家数据类型
export interface Country {
    id: string;
    name: string;
    nameDisplay: string;
    code: string;
    states: State[];
}

export interface State {
    id: string;
    name: string;
    englishName: string;
    twoWordCode: string;
    stateNameDisplay: string;
}

// 获取国家列表
export const getCountryList = async (): Promise<Country[]> => {
    const query = `
    fragment CountryFragment on Country {
      name
      nameDisplay
      id
      code
      states {
        id
        name
        englishName
        twoWordCode
        stateNameDisplay
      }
    }

    query searchCountry($condition: ListQueryParam!) {
      searchCountry(condition: $condition) {
        list {
          ...CountryFragment
        }
        total
      }
    }
  `;

    const variables = {
        condition: {
            pageSize: 1000,
            orders: [
                {
                    field: "name",
                    order: "ASC"
                }
            ]
        }
    };

    try {
        const result = await graphqlRequest(query, variables);
        return result?.searchCountry?.list || [];
    } catch (error) {
        console.error('获取国家列表失败:', error);
        return [
            { id: '1', name: 'China', nameDisplay: '中国', code: 'CN', states: [] },
            { id: '2', name: 'USA', nameDisplay: '美国', code: 'US', states: [] },
            { id: '3', name: 'Japan', nameDisplay: '日本', code: 'JP', states: [] },
            { id: '4', name: 'Korea', nameDisplay: '韩国', code: 'KR', states: [] },
        ];
    }
};

/** ========== 供应商相关接口 ========== */

// 定义供应商数据类型
export interface Supplier {
    id: string
    name: string
    englishName: string
    code: string
    supplierShort: string
    status: string
    country: Country
    corporationAddress: string
    personName: string
    personPhone: string
    email: string
}

// 获取供应商列表
export async function getSupplierList() {
    const query = `
      query {
        searchSupplier(condition:{ pageIndex:1, pageSize:200 }) {
          list {
            id
            name
            englishName
            code
            supplierShort
            country { name nameDisplay id code }
          }
        }
      }
    `;

    try {
        console.log('发送供应商查询请求...');
        const result = await graphqlRequest(query);
        console.log('供应商查询结果:', result);

        if (!result || !result.searchSupplier) {
            console.error('供应商查询返回数据格式错误:', result);
            return [];
        }

        const list = result.searchSupplier.list || [];
        console.log(`获取到 ${list.length} 个供应商`);

        return list;
    } catch (error) {
        console.error('获取供应商列表失败:', error);
        return [];
    }
}

/** ========== 用户相关接口 ========== */

// 定义用户数据类型
export interface User {
    id: string
    name: string
    alias: string
    userName: string
    status: string
    needChange: boolean
    manager: string
    subManager: string
    createTime: string
    opTime: string
    operator: string
    department?: {
        id: string
        name: string
        level: number
    }
    expectDepartment?: {
        name: string
    }
    userRoles?: {
        role: {
            id: string
            name: string
        }
    }[]
}

// 获取用户列表
export async function getUserList() {
    const query = `
      fragment UserFragment on User {
        needChange
        expectDepartment {
          name
        }
        userName
        name
        id
        alias
        status
        subManager
        userRoles {
          role {
            name
            id
          }
        }
        opTime
        operator
        createTime
        manager
        department {
          name
          id
          level
        }
      }

      query searchUser($condition: ListQueryParam!) {
        searchUser(condition: $condition) {
          list {
            ...UserFragment
          }
          total
        }
      }
    `;

    const variables = {
        condition: {
            pageIndex: 1,
            pageSize: 200,
            orders: [
                {
                    field: "name",
                    order: "ASC"
                }
            ]
        }
    };

    try {
        console.log('发送用户查询请求...');
        const result = await graphqlRequest(query, variables);
        console.log('用户查询结果:', result);

        if (!result || !result.searchUser) {
            console.error('用户查询返回数据格式错误:', result);
            return [];
        }

        const list = result.searchUser.list || [];
        console.log(`获取到 ${list.length} 个用户`);

        return list;
    } catch (error) {
        console.error('获取用户列表失败:', error);
        return [];
    }
}
/** ========== 品牌相关接口 ========== */

// 定义品牌数据类型
export interface Brand {
    id: string
    brandName: string
}

// 获取品牌列表
export async function getBrandList() {
    const query = `
      query searchBrand($condition: ListQueryParam!) {
        searchBrand(condition: $condition) {
          list {
            brandName
            id
          }
          total
        }
      }
    `;

    const variables = {
        condition: {
            pageIndex: 1,
            pageSize: 200,  // 根据需要调整数量
            orders: [
                {
                    field: "brandName",
                    order: "ASC"
                }
            ]
        }
    };

    try {
        console.log('发送品牌查询请求...');
        const result = await graphqlRequest(query, variables);
        console.log('品牌查询结果:', result);

        if (!result || !result.searchBrand) {
            console.error('品牌查询返回数据格式错误:', result);
            return [];
        }

        const list = result.searchBrand.list || [];
        console.log(`获取到 ${list.length} 个品牌`);

        return list;
    } catch (error) {
        console.error('获取品牌列表失败:', error);
        return [];
    }
}
/** ========== 混发组相关接口 ========== */

// 定义混发组数据类型
export interface MixtureRelease {
    id: string
    releaseName: string
    releaseEnglishName: string
    createBy?: {
        id: string
        name: string
    }
    updateBy?: {
        id: string
        name: string
    }
    createTime: string
    modifyTime: string
}

// 获取混发组列表
export async function getMixtureReleaseList() {
    const query = `
      query {
        searchProductMixtureRelease(condition: {
          pageIndex: 1,
          pageSize: 5000,
          queries: [],
          orders: [{field: "createTime", order: "desc"}]
        }) {
          list {
            id
            releaseName
            releaseEnglishName
            createBy {
              id
              name
            }
            updateBy {
              id
              name
            }
            createTime
            modifyTime
          }
          total
        }
      }
    `;

    try {
        console.log('发送混发组查询请求...');
        const result = await graphqlRequest(query);
        console.log('混发组查询结果:', result);

        if (!result || !result.searchProductMixtureRelease) {
            console.error('混发组查询返回数据格式错误:', result);
            return [];
        }

        const list = result.searchProductMixtureRelease.list || [];
        console.log(`获取到 ${list.length} 个混发组`);

        return list;
    } catch (error) {
        console.error('获取混发组列表失败:', error);
        return [];
    }
}