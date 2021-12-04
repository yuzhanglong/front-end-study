import { reactive } from 'vue';

export const usePagination = (requestMethod, params) => {
  let state = reactive({
    data: {
      items: [],
      page: 0,
      total: 0,
      totalPage: 0,
      count: 0,
    },
  });

  let changeCurrentPage = async () => {
    try {
      const response = await requestMethod(params);
      console.log(response);
      state.data = response.data;
      console.log(state);
    } catch (e) {
      //TODO: 异常处理
      console.log(e);
    }
  };

  return {
    state,
    changeCurrentPage,
  };
};
