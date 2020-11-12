import {applyMiddleware, createStore} from "redux";
import reducer from "./reducer";
import thunkMiddleware from 'redux-thunk'

const middleware = applyMiddleware(thunkMiddleware);
console.log(middleware);
const store = createStore(reducer, middleware);

export default store;
