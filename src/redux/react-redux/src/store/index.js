import { applyMiddleware, compose, createStore } from 'redux'
import reducer from './reducer'
import thunkMiddleware from 'redux-thunk'
import createSagaMiddleware from 'redux-saga'
import mySaga from '../saga/sagas'

const composeEnhancers =
  (typeof window !== 'undefined' &&
    window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__) ||
  compose

const sagaMiddleware = createSagaMiddleware()

const middlewares = applyMiddleware(thunkMiddleware, sagaMiddleware)

const store = createStore(reducer, composeEnhancers(middlewares))

sagaMiddleware.run(mySaga)

export default store
