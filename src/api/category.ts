import axios from 'axios'

export const getCategoryList = async () => {
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
    }
  `
    const res = await axios.post(
        '/api/graphql',
        { query },
        {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
        }
    )
    return res.data.data.searchCategory.list
}
