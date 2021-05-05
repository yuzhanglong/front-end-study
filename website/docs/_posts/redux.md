---
date: 2021-4-22

tags:

- Redux
---

# Redux 基础与实践

[[toc]]

## 什么是 redux

Redux 官网如下描述：Redux 是 JavaScript 应用程序的可预测状态容器。

它认为 Web 应用是一个状态机，视图和状态一一对应，所有的状态保存在一个对象（`store`）里面。

下图是 redux 的工作流程：

![](http://cdn.yuzzl.top/blog/20210503180514.png)

## 基本概念

结合上图，我们可以看出 redux 的核心主要有以下几部分。

### store

store 可以理解为状态中心，用来保存状态，一个 app 只有一个 store，它是只读的。

### state

store 包含的对象在某个时间点的状态。

### action

前面已经说过，store 对用户是只读的，用户只能通过 view 层面来更新 store，action 就是 view 层的指令（通知），表示 state 应该要发生变化了。

### action creator

生成 action 的一个函数

### reducer

store 接受到 **action** 之后，给出一个新的 state 以让 view 发生变化，这种 state 的计算就是 reducer，它是一个函数，以 `previousState` 和 `action` 为参数，返回一个新的 `state`。

### dispatch

view 通过 **dispatch** 发送 **action**。

## redux 的意义

- 以 react 为例，一开始，数据很简单，父组件把自身的状态共享给子组件：

- 随着功能的增加，非父子组件又要共享状态，于是我们可以利用事件机制来处理，也可以理解成**状态提升**

- 之后，组件树越来越复杂，通信的数据流向也越来越大，难以维护，尤其是那种非线性的、单向的数据流动

- 于是我们可以使用 redux，某一个 view 发生变化，直接通过 dispatch 交付给 store，然后 store 执行相应的 render

![](http://cdn.yuzzl.top/blog/20210503183109.png)

- 另外，redux 的每一个 state 都可以进行追踪，方便调试与 bug 修复

## 和 redux 的结合

下面是一个案例：

![](http://cdn.yuzzl.top/blog/20201112185931.png)

- 通过 `mapDispatchToProps` 拿到各类 dispatch 函数，然后通过调用他们来执行更新，我们可以利用高阶组件来完成此类功能。 
- 通过 `mapStateToProps` 来实现状态到视图的映射。

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


## 最佳实践

- 区分 **smart component**（和 state 密切相关，例如路由组件） 和 **dump component**（和全局 state 无关，内容由 props 决定，例如 UI 组件库中的组件）

- 让预处理（例如网络请求）尽可能在 **smart component** 中完成

- action 应该由 **smart components** 产生

- reducer 不要太复杂，使用对象展开符保证可读性，计算层面的内容请放到 action creator 中，return 新的 state 时注意返回一个新的对象，不要在旧对象上修改

- 组件内不要去处理网络请求等异步操作，此类操作请交给 action creator。

