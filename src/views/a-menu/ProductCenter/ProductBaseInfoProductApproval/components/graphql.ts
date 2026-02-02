// graphql.ts
import gql from 'graphql-tag';

export const GET_PRODUCT_LIBRARY = gql`
  query getProductLibrary($search: [String!]) {
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
          {
            field: "sku"
            type: "contains"
            values: $search
            negate: false
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
        productName
        createTime
      }
    }
  }
`;

export const GET_PRODUCT_SKU = gql`
  query getProductSku($search: [String!]) {
    searchApprovalProduct(
      condition: {
        pageIndex: 1
        pageSize: 1000
        queries: [
          {
            field: "sku"
            type: "contains"
            values: $search
            negate: false
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
        productName
        createTime
        countryList {
          id
          name
        }
      }
    }
  }
`;

// 添加一个新的查询，不使用搜索变量
export const GET_PRODUCT_LIBRARY_NO_SEARCH = gql`
  query getProductLibraryNoSearch {
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
        productName
        createTime
      }
    }
  }
`;

export const GET_PRODUCT_SKU_NO_SEARCH = gql`
  query getProductSkuNoSearch {
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
        productName
        createTime
        countryList {
          id
          name
        }
      }
    }
  }
`;