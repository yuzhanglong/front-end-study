---
date: 2021-4-22

tags:

- Redux

---

# Redux 基础

[[toc]]

## 核心

redux 的核心主要有以下三部分。

### store

store 可以理解为状态中心，用来保存状态，例如现在有一个计数器的初始状态：

```javascript
const initialState = {
  counter: 0
}
// 通过 redux.createStore() 初始化 store
const store = redux.createStore(reducer);
```

- store 是只读的
- store 单一数据流 -- 整个应用 state 都被储存在一个 store 里面 构成一个 Object tree。

### action

Actions 是一个 JavaScript 对象，用来描述应当更新的 state 的任何事件。

这些对象里应当包含一个 type 属性，为了区别每一种事件类型，来看下面代码：

```javascript
const action1 = {
  type: "INCREMENT"
}

const action2 = {
  type: "DECREMENT"
}

const action3 = {
  type: "ADD_NUMBER",
  num: 10
}

const action4 = {
  type: "SUB_NUMBER",
  num: 10
}
```

### reducer

reducer 是 `state`和`action`中间的桥梁，根据`action`来处理`state`，它必须是纯函数:

```javascript
function reducer(state = initialState, action) {
  switch (action.type) {
    case "INCREMENT":
      return { ...state, counter: state.counter + 1 };
    case "DECREMENT":
      return { ...state, counter: state.counter - 1 };
    case "ADD_NUMBER":
      return { ...state, counter: state.counter + action.num };
    case "SUB_NUMBER":
      return { ...state, counter: state.counter - action.num };
    default:
      return state;
  }
}
```

## 状态订阅与更新

### 订阅

通过`subscribe`传入回调函数来订阅`store`的变化，请看下面的代码：

```javascript
// store
const store = redux.createStore(reducer);

// 订阅store修改
store.subscribe(() => {
  console.log("state changed!");
  console.log(store.getState());
})

```

### 更新

通过`store.dispatch`来对`store`进行更新，更新完成之后，订阅时传入的回调函数会被执行：

```javascript
store.dispatch(action1);
store.dispatch(action2);
store.dispatch(action3);
store.dispatch(action4);
```

## Redux + React

上面已经理清了 Redux 数据处理的基本流程，那么 Redux 如何结合 React？结合上面的普通 redux 代码，我们试着写出一个 react 组件。

### store 初始化

首先，组件创建时时初始化`store`并订阅`store`：

```jsx
useEffect(() => {
  setCount(store.getState().counter);
  return store.subscribe(() => {
    setCount(store.getState().counter);
  });
}, []);
```

在上面的代码中，我们使用`useEffect`来初始化计数器的状态`counter = 5`，然后传入回调函数，订阅变动, 一旦发生变化，我们会执行`setCount`进行`render`。

### 业务逻辑触发 store 修改

触发某个业务逻辑时执行`dispatch(action)`：

```jsx
const addNumber = (number) => {
  store.dispatch(addAction(number));
}

return (
  <div>
    <h1>home</h1>
    <h2>当前计数：{count}</h2>
    <button onClick={() => addNumber(1)}>add</button>
  </div>
)
```

在上面的代码中，按钮单击，执行了`store.dispatch(addAction(number))`，计数器加一。

代码汇总如下：

```jsx
/*
 * File: Home.js
 * Description: redux 计数器demo
 * Created: 2020-11-9 14:08:48
 * Author: yuzhanglong
 * Email: yuzl1123@163.com
 */

import React, { useEffect, useState } from "react";
import store from "../store";
import { addAction, subAction } from "../store/action";

const Home = () => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    setCount(store.getState().counter);
    return store.subscribe(() => {
      setCount(store.getState().counter);
    });
  }, []);


  const addNumber = (number) => {
    store.dispatch(addAction(number));
  }

  const minusNumber = (number) => {
    store.dispatch(subAction(number));
  }

  return (
    <div>
      <h1>home</h1>
      <h2>当前计数：{count}</h2>
      <button onClick={() => addNumber(1)}>add</button>
      <button onClick={() => addNumber(10)}>add 10</button>
      <button onClick={() => minusNumber(1)}>minus</button>
    </div>
  )
}
export default Home;
```

### 基于高阶组件的封装

可以发现，如果有多个组件需要依赖这个`store`，我们会有大量的重复代码，非常难以管理，于是我们对其进行进一步封装：

```javascript
// connect() is a function that injects Redux-related props into your component.
// You can inject data and callbacks that change that data by dispatching actions.
function connect(mapStateToProps, mapDispatchToProps) {
  // It lets us inject component as the last step so people can use it as a decorator.
  // Generally you don't need to worry about it.
  return function(WrappedComponent) {
    // It returns a component
    return class extends React.Component {
      render() {
        return (
          // that renders your component
          <WrappedComponent
            {/* with its props  */}
            {...this.props}
            {/* and additional props calculated from Redux store */}
            {...mapStateToProps(store.getState(), this.props)}
            {...mapDispatchToProps(store.dispatch, this.props)}
          />
        )
      }

      componentDidMount() {
        // it remembers to subscribe to the store so it doesn't miss updates
        this.unsubscribe = store.subscribe(this.handleChange.bind(this))
      }

      componentWillUnmount() {
        // and unsubscribe later
        this.unsubscribe()
      }

      handleChange() {
        // and whenever the store state changes, it re-renders.
        this.forceUpdate()
      }
    }
  }
}

// This is not the real implementation but a mental model.
// It skips the question of where we get the "store" from (answer: <Provider> puts it in React context)
// and it skips any performance optimizations (real connect() makes sure we don't re-render in vain).

// The purpose of connect() is that you don't have to think about
// subscribing to the store or perf optimizations yourself, and
// instead you can specify how to get props based on Redux store state:

const ConnectedCounter = connect(
  // Given Redux state, return props
  state => ({
    value: state.counter,
  }),
  // Given Redux dispatch, return callback props
  dispatch => ({
    onIncrement() {
      dispatch({ type: 'INCREMENT' })
    }
  })
)(Counter)
```

#### 存在的问题

这个`connent`高阶组件工作顺利，但是会发现这个封装还不够完美 -- 我们的`connent`还是依赖着`store`这一业务代码，假如它是一个库的话，那么是不尽人意的，来看看如何优化。

#### 进一步封装

我们可以使用`UseContext`钩子来处理：
![](http://cdn.yuzzl.top/blog/20201109211250.png)

## Redux 中间件

redux 有一个中间件的概念，这个中间件的目的是在`dispatch`/`action`和最终到达的`reducer`之间扩展自己的代码，例如日志记录、网络请求。

### redux-thunk

#### 介绍及实践

我们都知道 Redux 规定`action`是一个简单对象（`plain object`），如果我们需要`action`为函数，将它执行过程中的某个内容`dispatch`就好了，redux 满足了我们这个要求，请看下图：

- main.js

![](http://cdn.yuzzl.top/blog/20201112185228.png)

- 主要逻辑

![](http://cdn.yuzzl.top/blog/20201112185931.png)

