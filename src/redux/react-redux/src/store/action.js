import {REMOTE_DATA, ADD_NUMBER, SUB_NUMBER} from "./constant";
import axios from "axios";

export const addAction = (num) => {
  return {
    type: ADD_NUMBER,
    num
  }
}

export const subAction = (num) => {
  return {
    type: SUB_NUMBER,
    num
  }
}

export const remoteAction = (data) => {
  return {
    type: REMOTE_DATA,
    data
  }
}


export const getHomeRequestAction = (dispatch) => {
  axios({
    url: "http://api.k780.com/?app=weather.today&weaid=1&appkey=10003&sign=b59bc3ef6191eb9f747dd4e83c99f2a4&format=json"
  })
    .then((res) => {
      dispatch(remoteAction(res.data.result))
    })

}

