import {ADD_NUMBER, REMOTE_DATA, SUB_NUMBER} from "./constant";

const initialState = {
  counter: 5,
  remoteData: null
}

function reducer(state = initialState, action) {
  switch (action.type) {
    case ADD_NUMBER:
      return {...state, counter: state.counter + action.num};
    case SUB_NUMBER:
      return {...state, counter: state.counter - action.num};
    case REMOTE_DATA:
      return {...state, data: action.data}
    default:
      return state;
  }
}

export default reducer;
