# React
参考资料：
https://mp.weixin.qq.com/s/3yoHo6UXI2VOPO9zWI2aCQ
## JSX本质

#### React.CreateElement()的语法糖

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
TODO

### Redux中间件
redux有一个中间件的概念，这个中间件的目的是在`dispatch`/`action`和最终到达的`reducer`之间扩展自己的代码，例如日志记录、网络请求。

#### redux-thunk

##### 介绍及实践
我们都知道Redux规定`action`是一个简单对象（`plain object`），如果我们需要`action`为函数，将它执行过程中的某个内容`dispatch`就好了，redux满足了我们这个要求，请看下图：
- main.js
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


#### Redux中间件原理
回顾一下初始化中间件的代码：
这里我们导入两个中间件（一个是`redux-thunk`，还有一个是一个简单的控制台打印）
```javascript
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
```

下面我们进入源码来看看`createStore`的整个过程，为了方便感受，我们使用Chrome的调试工具。

![](http://cdn.yuzzl.top/blog/20201112224425.png)
忽略掉一些边界处理、异常处理，首先程序走到了红框处，当`preloadedState`为`function`时，将`enhancer`指向它。然后执行`enhancer`(绿色部分), 也就是执行`const middlewares = applyMiddleware(thunkMiddleware, loggerMiddleware)`的返回值。

我们单步进入`enhancer` (也就是执行`enhancer(createStore)`),返回一个函数:

![](http://cdn.yuzzl.top/blog/20201112225322.png)

再次单步进入，=也就是执行`enhancer(createStore)(reducer, preloadedState)`:

![](http://cdn.yuzzl.top/blog/20201112234317.png)
我们又执行了一次`createStore`, 第一个参数为`void 0`, 第二个参数为`arguments`,也就是`reducer`和`preloadedState(null)`, 再次单步进入，这次我们主要执行**红框部分**的逻辑：

![](http://cdn.yuzzl.top/blog/20201112235443.png)

可以看到，这个函数返回了`store`的一套API，例如我们熟悉的`dispatch`、`subscribe`：

![](http://cdn.yuzzl.top/blog/20201112235830.png)

继续往下执行，这里是最核心的部分，主要有三部分，先看下图:

![](http://cdn.yuzzl.top/blog/20201113103927.png)


- （①处）初始化为中间件提供的API:`middlewareAPI`
- （②处）遍历传入的中间件，并以`middlewareAPI`为参数调用他们，一个标准中间件的结构长这样（为了便于理解我使用`function`而不是箭头函数），最后返回一个由一个个函数组成的数组，数组的每一项便是红框里面的内容：

![](http://cdn.yuzzl.top/blog/20201113105831.png)

![](http://cdn.yuzzl.top/blog/20201113102845.png)


- （③处）利用`compose`将上面数组的`middlewares`链接到一起，构成一个新的函数, 来看`compose`:

```javascript
function compose() {
  // 省略了边界条件判断的代码，下面的代码是关键
  // funcs 可以看成前面传入的chain

  return funcs.reduce(function (a, b) {
    return function () {
      return a(b.apply(void 0, arguments));
    };
  });
}
```
首先我们需要知道`reduce`的语法，他其实就是为数组的每一项调用`reducer`，它是一个函数，两个参数的意义分别为：

- 上一次调用`reducer`的返回值
- 本次遍历到的内容

上面的代码返回一个新的**函数** -- 这个函数一旦被执行，将链式地调用每一个传入的函数，也就是执行这一行代码：
```javascript
return a(b.apply(void 0, arguments));
```
如果有多个函数，那么我们很容易的到下面的执行链 -- 将所有的中间件**自右向左**链式调用,后一个函数的返回值作为前一个函数的参数：

```javascript
函数1(函数2(函数3 ... (参数)))
```

- （④处）执行这个链式的函数，参数为`store.dispatch`, 并返回一个新的函数`F(x)`：

![](http://cdn.yuzzl.top/blog/20201113105943.png)

我们令最里面那个红框为`f(action)`, 则最终返回的函数为：

```javascript
F(action) = f(f(action)))
```
这个函数会覆盖原来的`dispatch`暴露给用户，以后用户一旦调用`dispatch(action)`即`F(action)`, 就会链式地调用每一个`f(action)`，我们拿`redux-thunk`源码再次体会一下：

![](http://cdn.yuzzl.top/blog/20201113110357.png)

用户一旦调用`dispatch(action)`, 执行红框部分，redux-thunk 执行这个函数式的`action` ,并传入redux提供的`dispatch`，我们的`action`就可以在函数中执行这个`dispatch`来进行`store`的更新。

如果传入的`action`不是函数，那么我们将它传给下一个中间件。

## Hook

基础hook的具体用法在这里不在赘述，请自行查阅官方文档。

### useReducer不是Redux

虽然`useReducer`的一些操作很像redux，但是组件之间是无法进行状态共享的。

请看下图，两个组件`Home`和`Hello`之间并不共享状态。

![](http://cdn.yuzzl.top//blog/20201115211604.png)

### 实现性能优化

#### 利用useCallback

在将一个组件中的函数，传递给子元素进行使用时，使用`useCallback `进行处理，来看下图：

![](http://cdn.yuzzl.top//blog/20201115224417.png)

上面的代码中，按下**test按钮**会导致了父组件重新渲染，一般情况下，`addOne`和`addTwo`会被重新定义，导致子组件也被重新渲染。

在使用了`useCallback`之后，由于`memo`的特性（比较`props`的前后变化），`addTwo`没有被重新定义，也就不会重新渲染。

#### 利用useMemo

请看下面的代码：

```jsx
import React, {useState} from "react";

const cal = (count) => {
  console.log("执行计算");
  let total = 0;
  for (let i = 1; i <= count; i++) {
    total += i;
  }
  return total;
}

const TryUseMemo = () => {
  const [count, setCount] = useState(10);
  const [show, setShow] = useState(false);
  let total = cal(count);
  return (
    <div>
      <h2>total:{total}</h2>
      <button onClick={() => setCount(count + 1)}>add</button>
      <button onClick={() => setShow(!show)}>change</button>
    </div>
  )
}

export default TryUseMemo
```

`count`和`show`发生改变，`TryUseMemo`会重新刷新，导致`total`重新计算，但是在改变`show`的时候计算结果并不会发生变化（也就是说无需重复计算），我们可以使用`useMemo`处理这种性能优化：

```jsx
import React, {useMemo, useState} from "react";

const cal = (count) => {
  console.log("执行计算");
  let total = 0;
  for (let i = 1; i <= count; i++) {
    total += i;
  }
  return total;
}

const TryUseMemo = () => {
  const [count, setCount] = useState(10);
  const [show, setShow] = useState(false);
  let total = useMemo(() => cal(count), [count]);
  return (
    <div>
      <h2>total:{total}</h2>
      <button onClick={() => setCount(count + 1)}>add</button>
      <button onClick={() => setShow(!show)}>change</button>
    </div>
  )
}

export default TryUseMemo
```

按下**change**按钮之后，【**执行计算**】文本不会被打印。

相对于`useCallback`，`useMemo`的返回值可以是多样的，更加灵活，前者只能是函数，我们可以用`useMemo`来实现`useCallback`:

```javascript
const foo = useMemo(() => {
	return () => {
		console.log("hello!");
    setCount(count + 1);
	}
})
```

### Hook底层原理

TODO

