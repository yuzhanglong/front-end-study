<template>
  <div>
    <p>{{ pagination }}</p>
    <button @click="pagination.changeCurrentPage">改变页码</button>
  </div>
</template>

<script>
import { usePagination } from './Composable/usePagination'

export default {
  name: 'App',
  setup() {
    const testPromise = () => {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            code: '00000',
            message: 'success',
            request: null,
            data: {
              total: 13,
              count: 15,
              page: 0,
              totalPage: 1,
              items: [
                {
                  id: 10011,
                  name: '最大连续和',
                  characterTags: ['DP'],
                  createTime: 1599539054591,
                  closed: false,
                },
                {
                  id: 10012,
                  name: '字符串匹配',
                  characterTags: ['测试'],
                  createTime: 1596104002325,
                  closed: false,
                },
              ],
            },
          })
        }, 1000)
      })
    }
    let pagination = usePagination(testPromise, {})
    return {
      pagination,
    }
  },
}
</script>
