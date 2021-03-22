# React

参考资料：
https://mp.weixin.qq.com/s/3yoHo6UXI2VOPO9zWI2aCQ

https://juejin.cn/post/6844903592831238157

https://github.com/brickspert/blog/issues/26

## JSX本质

#### React.CreateElement()的语法糖

JSX是`React.CreateElement()`的语法糖，来看看官网对这个API的解释：

![](http://cdn.yuzzl.top/blog/20201107101507.png)

来看看下面的代码，`data`/`data2` 效果是一样的，可以解释上面的结论：

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

它需要三个参数`type`/`config`/`children`，分别表示**当前React元素的类型**/**jsx的属性**/**存放在标签里面的内容**，最终返回一个`ReactElement`对象(树) -- 也就是所谓的**
虚拟DOM**。

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
  return ({dispatch, getState}) => next => action => {
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

回顾一下初始化中间件的代码： 这里我们导入两个中间件（一个是`redux-thunk`，还有一个是一个简单的控制台打印）

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
忽略掉一些边界处理、异常处理，首先程序走到了红框处，当`preloadedState`为`function`时，将`enhancer`指向它。然后执行`enhancer`(绿色部分),
也就是执行`const middlewares = applyMiddleware(thunkMiddleware, loggerMiddleware)`的返回值。

我们单步进入`enhancer` (也就是执行`enhancer(createStore)`),返回一个函数:

![](http://cdn.yuzzl.top/blog/20201112225322.png)

再次单步进入，=也就是执行`enhancer(createStore)(reducer, preloadedState)`:

![](http://cdn.yuzzl.top/blog/20201112234317.png)
我们又执行了一次`createStore`, 第一个参数为`void 0`, 第二个参数为`arguments`,也就是`reducer`和`preloadedState(null)`, 再次单步进入，这次我们主要执行**红框部分**
的逻辑：

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
函数1(函数2(函数3
...
(参数)
))
```

- （④处）执行这个链式的函数，参数为`store.dispatch`, 并返回一个新的函数`F(x)`：

![](http://cdn.yuzzl.top/blog/20201113105943.png)

我们令最里面那个红框为`f(action)`, 则最终返回的函数为：

```javascript
F(action) = f(f(action))
)
```

这个函数会覆盖原来的`dispatch`暴露给用户，以后用户一旦调用`dispatch(action)`即`F(action)`, 就会链式地调用每一个`f(action)`，我们拿`redux-thunk`源码再次体会一下：

![](http://cdn.yuzzl.top/blog/20201113110357.png)

用户一旦调用`dispatch(action)`, 执行红框部分，redux-thunk 执行这个函数式的`action` ,并传入redux提供的`dispatch`，我们的`action`就可以在函数中执行这个`dispatch`
来进行`store`的更新。

如果传入的`action`不是函数，那么我们将它传给下一个中间件。

## Hook

基础hook的具体用法在这里不在赘述，请自行查阅官方文档。

### useReducer不是Redux

虽然`useReducer`的一些操作很像redux，但是组件之间是无法进行状态共享的。

请看下图，两个组件`Home`和`Hello`之间并不共享状态。

![](http://cdn.yuzzl.top//blog/20201115211604.png)

### useRef和useImperativeHandle

现在我们要实现这样一个案例，一个input和一个button，做到按下button让input聚焦，另外，input位于子组件，button位于父组件。

针对此需求，我们采用`useRef`，`useRef`是React为我们提供的访问DOM的方式。

```jsx
import React, {useRef} from "react";

const MyInput = React.forwardRef((props, ref) => {
  return <input type={"text"} ref={ref}/>
})

const TryUseImperativeHandle = () => {
  const inputRef = useRef();
  return (
    <div>
      <MyInput ref={inputRef}/>
      <button onClick={() => inputRef.current.focus()}>focus!</button>
    </div>
  )
}

export default TryUseImperativeHandle;
```

值得注意的是，通过`inputRef`，我们可以对`MyInput`进行所有的DOM操作，但有时组件只希望暴露`focus`给调用者，而把其他功能私有化，这时候我们就需要用到`useImperativeHandle`，来看下面代码：

```jsx
import React, {useImperativeHandle, useRef} from "react";

const MyInput = React.forwardRef((props, ref) => {
  const myRef = useRef();
  useImperativeHandle(ref, () => {
    return {
      focus: () => {
        myRef.current.focus();
      }
    }
  })
  return <input type={"text"} ref={myRef}/>
})


const TryUseImperativeHandle = () => {
  const inputRef = useRef();
  return (
    <div>
      <MyInput ref={inputRef}/>
      <button onClick={() => inputRef.current.focus()}>focus!</button>
    </div>
  )
}

export default TryUseImperativeHandle;
```

执行`inputRef.current.focus()`，我们会走到**第八行**，执行里面的内容。

### Hook原理浅析

#### requestIdleCallback

在一帧里面，浏览器要做的事情有很多，请看下图：

![](http://cdn.yuzzl.top/blog/162d853396355715)

- 用户事件的响应
- JS代码的执行
- 事件的一些响应

- Raf --`requestAnimationCallback()`
- 布局
- 绘制
- 其他耗时的操作

当React决定要加载或者更新组件树时，会做很多事，比如调用各个组件的生命周期函数，计算和比对VDOM，最后更新DOM树，这整个过程是**同步**
进行的。假如更新一个组件需要1毫秒，如果有200个组件要更新，那就需要200毫秒，在这200毫秒的更新过程中，浏览器那个唯一的主线程都在专心运行更新操作，无暇去做任何其他的事情。假如用户在某个输入框中输入一些东西，那么必然会造成一些卡顿。

于是我们可以使用这个API：`requestIdleCallback()`，这个API会在浏览器处理上述事件之后再来执行回调。

#### Fiber

React把它的一些操作切分成一个个Fiber（可以理解为执行单元/碎片），利用`requestIdleCallback()`在空闲时间执行Fiber碎片，当然这个API是有兼容性问题的，React自行实现了一个方案。

#### 试着写一个简单的hook

先不管react的底层如何实现，其实根据hooks的逻辑我们可以实现一个简易版的，主要利用了闭包：

为了方便起见, 我们令render函数为App入口的**render**。

##### 简易版的useState 1.0

```jsx
// version 1 单个state，利用了闭包，但是全局只能使用一次
let state = null;
export const useState = (initialValue) => {
  state = state || initialValue;
  const setState = (newState) => {
    state = newState;
    render();
  }
  return [state, setState];
}

const DemoHooks = () => {
  const [count, setCount] = useState(0);
  return (
    <div>
      <div>
        {count}
      </div>
      <button onClick={() => setCount(count + 1)}>add!</button>
    </div>
  )
}

export default DemoHooks;
```

维护一个全局`state`遍历，当`setState`被执行后重新`render`，但是可以发现我们只能使用一个`useState`。

##### 简易版的useState 2.0

利用数组，我们可以维护多个state：

```jsx
// version 2 可以支持多个state 这里存放的数据结构是数组，当然我们也可以使用链表
let memorizedState = [];
let currentPosition = 0;

const doRender = () => {
  currentPosition = 0;
  render();
}

export const useState = (initialValue) => {
  memorizedState[currentPosition] = memorizedState[currentPosition] || initialValue;
  // 这里复制了currentPosition，保证一个useState对应正确的Position
  const currentStatePos = currentPosition;
  const setState = (newState) => {
    memorizedState[currentStatePos] = newState;
    doRender();
  }
  return [memorizedState[currentPosition++], setState];
}


const DemoHooks = () => {
  const [count, setCount] = useState(0);
  const [count2, setCount2] = useState("hello");
  console.log(memorizedState);
  return (
    <div>
      <div>
        {count}
      </div>
      <div>
        {count2}
      </div>
      <button onClick={() => setCount(count + 1)}>add!</button>
      <button onClick={() => setCount2(count2 + "aaa")}>add-2!</button>
    </div>
  )
}

export default DemoHooks;
```

执行流程描述如下：

- 初始状态：`memorizedState`为空。
- 首次渲染，`useState(0)`，`useState("hello")`先后被执行，此时 `memorizedState = [0, "hello"]`,  `currentPosition = 2`。
- 按钮被单击，`setState`被执行，触发**render**。同时**currentPosition**被置为0，然后循环上面的操作。

#### 真正的React实现

虽然我们用数组基本实现了一个可用的 Hooks，了解了 Hooks 的原理，但在 React 中，实现方式却有一些差异的。

- React 中是通过类似单链表的形式来代替数组的。通过 next 按顺序串联所有的 hook。

  ```typescript
  type Hooks = {
  	memoizedState: any, // 指向当前渲染节点 Fiber
    baseState: any, // 初始化 initialState， 已经每次 dispatch 之后 newState
    baseUpdate: Update<any> | null,// 当前需要更新的 Update ，每次更新完之后，会赋值上一个 update，方便 react 在渲染错误的边缘，数据回溯
    queue: UpdateQueue<any> | null,// UpdateQueue 通过
    next: Hook | null, // link 到下一个 hooks，通过 next 串联每一 hooks
  }
   
  type Effect = {
    tag: HookEffectTag, // effectTag 标记当前 hook 作用在 life-cycles 的哪一个阶段
    create: () => mixed, // 初始化 callback
    destroy: (() => mixed) | null, // 卸载 callback
    deps: Array<mixed> | null,
    next: Effect, // 同上 
  };
  ```

- memoizedState，cursor 是存在哪里的？如何和每个函数组件一一对应的？

  我们知道，react 会生成一棵组件树（或Fiber 单链表），树中每个节点对应了一个组件，hooks 的数据就作为组件的一个信息，存储在这些节点上，伴随组件一起出生，一起死亡。

![](http://cdn.yuzzl.top/blog/20201121182057.png)

## 组件化

### Protals

某些情况下，我们希望渲染的内容独立于父组件，甚至是独立于当前挂载的DOM元素中。

一个经典案例：antd的**Modal对话框**组件。

此时我们可以使用**Protals**。

![](http://cdn.yuzzl.top//blog/20201116232803.png)

### 高阶组件

#### 扩展props

```jsx
import React from "react";

const enhanceAge = (Wrapper) => {
  return (props) => {
    return (
      <Wrapper {...props} age={20}/>
    )
  }
}

const User = (props) => {
  return (
    <div>
      <div>name:{props.name}</div>
      <div>age:{props.age}</div>
    </div>
  )
}

const En = enhanceAge(User);

const EnhanceProps = (props) => {
  return (
    <div>
      <En name={"yzl"}/>
    </div>
  )
}

export default EnhanceProps;
```

上面的代码为**User**组件扩展了**age**的prop。

#### 鉴权

```jsx
import React from "react";

const Login = () => {
  return <h2>请登录</h2>
}

const enhanceAuth = (WrapperCmp) => {
  return (props) => {
    const {isLogin} = props;
    if (isLogin) {
      return <WrapperCmp {...props}/>
    } else {
      return <Login/>
    }
  }
}


const Data = () => {
  return (
    <div>data</div>
  )
}

const AuthData = enhanceAuth(Data);

const EnhanceAuth = (props) => {
  return (
    <div>
      <AuthData isLogin/>
    </div>
  )
}

export default EnhanceAuth;
```

在上面的代码中，`isLogin`如果为`false`，则渲染**Login**，否则渲染**Data**。

#### ReactRouter的withRouter原理

**React-Router**的源码的特点是逻辑比较分散（一个实现可能需要关联大量的文件），我将`withrouter`相关的代码全部放在一起来解释。

```jsx
// context工厂函数，为context添加了displayName，最终返回创建好的context
const createNamedContext = name => {
  const context = createContext();
  context.displayName = name;
  return context;
};

// 创建命名context
const RouterContext = createNamedContext("Router");


function withRouter(Component) {
  // 初始化名称
  const displayName = `withRouter(${Component.displayName || Component.name})`;
  const C = props => {
    // 提取出ref以及剩下的props
    const {wrappedComponentRef, ...remainingProps} = props;

    return (
      <RouterContext.Consumer>
        {context => {
          // 如果context不存在，会抛出异常
          invariant(
            context,
            `You should not use <${displayName} /> outside a <Router>`
          );

          // 将context传入component
          return (
            <Component
              {...remainingProps}
              {...context}
              ref={wrappedComponentRef}
            />
          );
        }}
      </RouterContext.Consumer>
    );
  };

  // 设置名称
  C.displayName = displayName;
  C.WrappedComponent = Component;

  // 这是调用了一个库，叫hoist-non-react-statics
  // 当你给一个组件添加一个HOC时，
  // 原来的组件会被一个container的组件包裹。
  // 这意味着新的组件不会有原来组件任何静态方法。
  return hoistStatics(C, Component);
}

export default withRouter;
```

**hoistStatics**的源码如下，其实就是把被包裹组件的静态方法绑定到**container**上：

```javascript
const defineProperty = Object.defineProperty;
const getOwnPropertyNames = Object.getOwnPropertyNames;
const getOwnPropertySymbols = Object.getOwnPropertySymbols;
const getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;
const getPrototypeOf = Object.getPrototypeOf;
const objectPrototype = Object.prototype;

export default function hoistNonReactStatics(targetComponent, sourceComponent, excludelist) {
  if (typeof sourceComponent !== 'string') { // don't hoist over string (html) components

    if (objectPrototype) {
      const inheritedComponent = getPrototypeOf(sourceComponent);
      if (inheritedComponent && inheritedComponent !== objectPrototype) {
        hoistNonReactStatics(targetComponent, inheritedComponent, excludelist);
      }
    }

    let keys = getOwnPropertyNames(sourceComponent);

    if (getOwnPropertySymbols) {
      keys = keys.concat(getOwnPropertySymbols(sourceComponent));
    }

    const targetStatics = getStatics(targetComponent);
    const sourceStatics = getStatics(sourceComponent);

    for (let i = 0; i < keys.length; ++i) {
      const key = keys[i];
      if (!KNOWN_STATICS[key] &&
        !(excludelist && excludelist[key]) &&
        !(sourceStatics && sourceStatics[key]) &&
        !(targetStatics && targetStatics[key])
      ) {

        const descriptor = getOwnPropertyDescriptor(sourceComponent, key);
        try {
          // 利用defineProperty绑定静态方法到targetComponent下
          defineProperty(targetComponent, key, descriptor);
        } catch (e) {
        }
      }
    }
  }
  return targetComponent;
};
```

## SetState

### 为什么使用它

- 如果我们直接修改**state**，React并不知道数据发生了变化，从而不会重新渲染。

- React并没有实现`Object.defineProperty`（vue2），或者`Proxy`（vue3）的劫持功能来实现数据监听。

- 所以我们必须使用`setState`。（注：我们能够在类中使用`setState`是继承的原因）

### 它是异步的

#### 原因

- 保证性能 -- 如果每次调用`setState`都进行一次更新，那么`render`函数就会被频繁调用。界面重新渲染，这样效率是很低的。（多个`setState`在内部会合并）

- 保证**state**和**props**的一致性。

#### 获取setState之后的结果

- 在`componentDidUpdate`中获取。
- `setState`的回调函数。

### setState同步的情况

- 使用`setTimeout`，来看下面的代码：

```javascript
setTimeout(() => {
  this.setState({
    message: "hello world"
  });
  console.log(this.state.message);
}, 0);
```

- 将代码放入原生的事件监听中。

### 源码浅析

TODO

## React性能优化

### diff算法

react通过render函数，产生新的DOM树，这个DOM树如果直接更新，会出现性能问题，所以我们要考虑减少大量的更新。

#### 算法简述

React的diff算法复杂度为**O(n)**，整体方案如下：

- 同层节点比较，不会跨节点比较
- 不同类型的节点产生不同的树结构
- 使用key来指定节点保持稳定。

#### 几个情形

##### 不同类型的节点产生不同的树结构

来看下面的代码：

![](http://cdn.yuzzl.top//blog/20201118203816.png)

这里如果t发生改变，MyCpn会被**销毁**，不会进行复用。

##### 同类型元素对比

##### 子节点递归

React会同时遍历两个子节点的列表，有差异时会生成一个**mutation**，我们只要把这个**mutation**插入DOM即可。

但是这种情况太理想了！如果是下面这种情况，那么就会带来不必要的渲染了（创建了3个mutation）！

> 注意：
> - key必须唯一
> - key不要用随机数 -- 在下一次重新渲染的时候，会重新生成
> - 使用index作为key毫无意义