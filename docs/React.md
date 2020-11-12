# React

## JSX本质

#### 它是React.CreateElement()的语法糖

JSX是`React.CreateElement()`的语法糖，来看看官网对这个API的解释：

![](http://cdn.yuzzl.top/blog/20201107101507.png)

来看看下面的代码，`data`/`data2`效果是一样的，可以解释上面的结论：

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <title>Title</title>
    <script crossorigin src="https://unpkg.com/react@16/umd/react.development.js"></script>
    <script crossorigin src="https://unpkg.com/react-dom@16/umd/react-dom.development.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/babel-standalone@6.26.0/babel.min.js"></script>
  </head>
  <body>
    <div id="app"></div>
    <script type="text/babel">
      const data = <h2>hello world</h2>;
      const data2 = React.createElement("h2", null, "hello world 2");
      ReactDOM.render(data2, document.getElementById("app"));
    </script>
  </body>
</html>
```

#### Babel在其中的作用

babel是个JavaScript编译器，我们都知道，**原生JS**是不可以直接解析下面的代码的：

```jsx
const data = <h2>hello world</h2>;
```

使用Babel就可以解析，我们可以使用官网的DEMO来验证我们的观点。

![](http://cdn.yuzzl.top/blog/20201107135043.png)

可以看到，我们的JSX语法被解析成了`React.CreateElement()`，同样印证了我们的结论。

#### React.CreateElement()

它需要三个参数`type`/`config`/`children`，分别表示**当前React元素的类型**/**jsx的属性**/**存放在标签里面的内容**，最终返回一个`ReactElement`对象(树) -- 也就是所谓的**虚拟DOM**。

![](http://cdn.yuzzl.top/blog/20201107135536.png)

值得注意的是，我们传入了四个参数，这和前面的三个参数有点矛盾。这是一个巧妙的地方，来看源码(位于` packages/react/src/ReactElement.js`)：

```javascript
// packages/react/src/ReactElement.js
const childrenLength = arguments.length - 2;
  if (childrenLength === 1) {
    props.children = children;
  } else if (childrenLength > 1) {
    const childArray = Array(childrenLength);
    for (let i = 0; i < childrenLength; i++) {
      childArray[i] = arguments[i + 2];
    }
    if (__DEV__) {
      if (Object.freeze) {
        Object.freeze(childArray);
      }
    }
    props.children = childArray;
  }
```

很明显，他使用了`arguments`这个默认属性，来处理多参数的问题，孩子大于1时，创建了一个数组，遍历传入的孩子，加入数组，赋给孩子。

## 虚拟DOM

### 概念

我们上面介绍过了`React.CreateElement()`这个API，它的创建结果是什么。来看这张图片：

![](http://cdn.yuzzl.top/blog/20201107144745.png)

可以看到我们生成了一颗JavaScript的对象树 -- 它就是所谓的**虚拟DOM（Virtual DOM）**，至此，我们可以看出React渲染的基本过程：

- JSX语法间接调用`createElement`。
- `createElement`返回`ReactElement`对象树。
- `ReactDOM.render`映射到真实DOM。

### 优点

为什么采用虚拟DOM：
- 难以跟踪状态的改变。
- 操作真实DOM性能较低。

## Redux
### 核心
redux的核心主要有以下三部分。

#### store

store可以理解为状态中心，用来保存状态，例如现在有一个计数器的初始状态：
```javascript
const initialState = {
  counter: 0
}
// 通过redux.createStore()初始化store
const store = redux.createStore(reducer);
```
#### action

action可以理解为**动作、行为**，通过它来改变`store`的状态：
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
#### reducer
`state`和`action`中间的桥梁，根据`action`来处理`state`:
```javascript
function reducer(state = initialState, action) {
  switch (action.type) {
    case "INCREMENT":
      return {...state, counter: state.counter + 1};
    case "DECREMENT":
      return {...state, counter: state.counter - 1};
    case "ADD_NUMBER":
      return {...state, counter: state.counter + action.num};
    case "SUB_NUMBER":
      return {...state, counter: state.counter - action.num};
    default:
      return state;
  }
}
```
### 状态订阅与更新
#### 订阅

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
#### 更新
通过`store.dispatch`来对`store`进行更新，更新完成之后，订阅时传入的回调函数会被执行：

```javascript
store.dispatch(action1);
store.dispatch(action2);
store.dispatch(action3);
store.dispatch(action4);
```

### Redux + React
上面已经理清了Redux数据处理的基本流程，那么Redux如何结合React？结合上面的普通redux代码，我们试着写出一个react组件。

#### store初始化
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


#### 业务逻辑触发store修改
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

import React, {useEffect, useState} from "react";
import store from "../store";
import {addAction, subAction} from "../store/action";

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
#### 基于高阶组件的封装
可以发现，如果有多个组件需要依赖这个`store`，我们会有大量的重复代码，非常难以管理，于是我们对其进行进一步封装，来看下图：
![](http://cdn.yuzzl.top/blog/20201109200208.png)

##### 存在的问题
这个`connent`高阶组件工作顺利，但是会发现这个封装还不够完美 -- 我们的`connent`还是依赖着`store`这一业务代码，假如它是一个库的话，那么是不尽人意的，来看看如何优化。

##### 进一步封装
我们可以使用`UseContext`钩子来处理：
![](http://cdn.yuzzl.top/blog/20201109211250.png)

#### React-redux源码浅析


### Redux中间件
redux有一个中间件的概念，这个中间件的目的是在`dispatch`/`action`和最终到达的`reducer`之间扩展自己的代码，例如日志记录、网络请求。

#### redux-thunk

##### 介绍及实践
我们都知道Redux规定`action`是一个简单对象（`plain object`），如果我们需要action为函数，将它执行过程中的某个内容`dispatch`就好了，redux满足了我们这个要求，请看下图：
- index.js
![](http://cdn.yuzzl.top/blog/20201112185228.png)

- 主要逻辑
![](http://cdn.yuzzl.top/blog/20201112185931.png)

##### 底层原理
`redux-thunk`是一个**标准的redux中间件**，它的代码**只有14行**，（但是它有15.5k Star！！），来学习一下:
```javascript
function createThunkMiddleware(extraArgument) {
  return ({ dispatch, getState }) => next => action => {
    if (typeof action === 'function') {
      return action(dispatch, getState, extraArgument);
    }

    return next(action);
  };
}

const thunk = createThunkMiddleware();
thunk.withExtraArgument = createThunkMiddleware;

export default thunk;
```
这个中间件的核心功能无非就是就是接受所有传入的`action`, 如果它是**函数**，则执行之，我们可以利用浏览器调试的方法来实践一下：
![](http://cdn.yuzzl.top/blog/20201112190749.png)
![](http://cdn.yuzzl.top/blog/20201112190947.png)


#### Redux中间件执行原理
回顾一下初始化中间件的代码：
```javascript
import {applyMiddleware, createStore} from "redux";
import reducer from "./reducer";
import thunkMiddleware from 'redux-thunk'

const store = createStore(reducer, applyMiddleware(thunkMiddleware))

export default store;
```
中间件是通过`applyMiddleware`，传入`createStore`的，来看`applyMiddleware`的源码：

```javascript
export default function applyMiddleware(...middlewares) {
  // applyMiddleware 返回一个函数
  return createStore => (...args) => {
    const store = createStore(...args)
    let dispatch = () => {
      throw new Error(
        'Dispatching while constructing your middleware is not allowed. ' +
          'Other middleware would not be applied to this dispatch.'
      )
    }


    // 暴露给每个middleware的API
    const middlewareAPI = {
      getState: store.getState,
      dispatch: (...args) => dispatch(...args)
    }
    
    const chain = middlewares.map(middleware => middleware(middlewareAPI))
    dispatch = compose(...chain)(store.dispatch)

    return {
      ...store,
      dispatch
    }
  }
}
```

我们进入`createStore`来看一下, 注意红色方框的部分，：
![](http://cdn.yuzzl.top/blog/20201112194859.png)
