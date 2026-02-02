// src/api/TestApi.ts
import axios from 'axios'

const testService = axios.create({
    baseURL: '/api',
    timeout: 5000,
})
testService.interceptors.request.use((config) => {
    const token = localStorage.getItem('token')
    if (token) {
        config.headers.Authorization = `Bearer ${token}`
    }
    return config
})
export const testGraphql = async (query: string, variables = {}) => {
    try {
        const res = await testService.post('/graphql',{
            query,
            variables,
        })
        if (res.data.errors){
            console.error('GraphQL 错误：',res.data.errors)
            throw new Error(res.data.errors[0].message)
        }
        return res.data.data
    } catch (err) {
        console.error('GraphQL 请求失败 ：',err)
        throw err
    }
}

const FULL_QUERY = `
fragment UserFragment on User {
  needChange
  expectDepartment { name }
  userName
  name
  id
  alias
  status
  subManager
  userRoles { role { name id } }
  opTime
  operator
  createTime
  manager
  department { name id level }
}

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

fragment SupplierFragment on Supplier {
  id
  approvalSupplierId
  name
  englishName
  code
  supplierShort
  trading
  taxRate
  startingTime
  startTime
  sell
  remark
  region
  status
  personPhone
  personName
  payment
  paymentPrepaid
  paymentDepositType
  paymentDeposit
  paymentCurrency {
    id
    currencySign
    currencyName
  }
  mould
  frame
  email
  country { ...CountryFragment }
  corporationAddress
  documentary { ...UserFragment }
  createBy { ...UserFragment }
  updateBy { ...UserFragment }
  contactAddress
  clause
  annualAudit
  attachmentUrl { fileUrl }
  creditCode
  accountInfo {
    accountType
    accountAddress
    accountName
    bankAccount
    bankAddress
    bankName
    openingBank
    remark
    swiftCode
    currency {
      currencyCode
      currencySign
      id
    }
  }
  businessLicense { fileUrl }
  auditDetails {
    annualAudit
    evaluationReportUrl { fileUrl }
    createTime
    remark
    appraiser { ...UserFragment }
  }
  planManager { ...UserFragment }
  purchase { ...UserFragment }
  quality { ...UserFragment }
  fieldInspector { ...UserFragment }
  createTime
  modifyTime
  employeeCount
  establishmentDate
  hasFiveBillionSales
  hasFiveCoreEngineers
  hasFiveLeadingBrandsExperience
  hasFiveThousandSquareFactory
  hasFiveYearsIndustryExperience
  salesVolume
  supplierSurvey { fileUrl }
  approvalSupplier {
    remark
    evaluationLevel
    evaluationReportUrlId { fileUrl }
  }
  mainProductInfo {
    refundRate
    mainProduct { id categoryName level }
  }
}

query searchSupplier($condition: ListQueryParam!) {
  searchSupplier(condition: $condition) {
    list {
      ...SupplierFragment
    }
    total
  }
}
`;

// 产品库查询
const PRODUCT_LIBRARY_QUERY = `
  query getProductLibrary {
    searchApprovalProduct(
      condition: {
        pageIndex: 1
        pageSize: 1000
        queries: [
          {
            field: "isSourceProductLibrary"
            type: "isTrue"
            negate: false
          }
          {
            field: "productLibraryStatus"
            type: "equals"
            values: "UNUSED"
          }
        ]
        orders: [
          {
            field: "createTime"
            order: "desc"
          }
        ]
      }
    ) {
      list {
        id
        sku
      }
    }
  }
`;

// SKU查询
const PRODUCT_SKU_QUERY = `
  query getProductSku {
    searchApprovalProduct(
      condition: {
        pageIndex: 1
        pageSize: 1000
        orders: [
          {
            field: "createTime"
            order: "desc"
          }
        ]
      }
    ) {
      list {
        id
        sku
      }
    }
  }
`;

export const testSearchSupplier = async () => {
    const variables = {
        condition: {
            pageIndex: 1,
            pageSize: 10,
            // 需要筛选条件可以加 queries: [...]
        }
    }

    const data = await testGraphql(FULL_QUERY, variables)
    console.log("测试 searchSupplier 返回：", data)
    return data
}

// 测试产品库查询
export const testProductLibrary = async () => {
    const data = await testGraphql(PRODUCT_LIBRARY_QUERY, {})
    console.log("测试产品库返回：", data)
    return data
}

// 测试SKU查询
export const testProductSku = async () => {
    const data = await testGraphql(PRODUCT_SKU_QUERY, {})
    console.log("测试SKU返回：", data)
    return data
}