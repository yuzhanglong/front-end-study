import {GET_REMOTE_DATA} from "../store/constant";
import {takeEvery, put} from "redux-saga/effects";
import axios from "axios";
import {changeHomeDataAction} from "../store/action";

function* getHomeRequest(action) {
  console.log(action);
  try {
    const res = yield axios.get("http://47.106.202.255:8081");
    yield put(changeHomeDataAction(res.data.message));
    console.log(res);
  } catch (e) {
    console.log(e);
  }
}

function* mySaga() {
  yield takeEvery(GET_REMOTE_DATA, getHomeRequest);
}


export default mySaga;
