# React

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

