import {
  REMOTE_DATA,
  ADD_NUMBER,
  SUB_NUMBER,
  GET_REMOTE_DATA,
} from './constant'
import axios from 'axios'

export const addAction = (num) => {
  return {
    type: ADD_NUMBER,
    num,
  }
}

export const subAction = (num) => {
  return {
    type: SUB_NUMBER,
    num,
  }
}

export const changeHomeDataAction = (data) => {
  return {
    type: REMOTE_DATA,
    data,
  }
}

export const remoteDataAction = () => {
  return {
    type: GET_REMOTE_DATA,
  }
}

export const getHomeRequestAction = (dispatch) => {
  axios({
    url: 'http://47.106.202.255:8081',
  }).then((res) => {
    dispatch(changeHomeDataAction(res.data.message))
  })
}
