import {applyMiddleware, createStore} from "redux";
import reducer from "./reducer";
import thunkMiddleware from 'redux-thunk';

const loggerMiddleware = middlewareAPI => next => action => {
  console.log('start dispatch: ', action)
  let result = next(action);
  console.log('next state: ', store.getState())
  return result
}

const middlewares = applyMiddleware(thunkMiddleware, loggerMiddleware);

const store = createStore(reducer, middlewares);

export default store;
