import redux from "redux";
import reducer from "./reducer";

const store = redux.createStore(reducer);
export default store;
