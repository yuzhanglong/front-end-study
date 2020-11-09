# Vue-Router源码解析
## 总述
### 前置知识
#### hashRouter

#### HTML5 History

## 从基本的路由开始
我们现在暂时抛开`Vue`这个限制，想想如何使用**原生JS**来实现一个路由管理工具，如此一来，**任何xxxRouter库**无非就是在这个基础上进行扩展，让其适应自身的框架，这便是一种**封装**思想的体现，我们现在讨论的`VueRouter`就是如此做的,来看下图（来自官方文档）：
![](http://cdn.yuzzl.top/blog/20201107205145.png)

可以发现，两种模式对应我们前面说到两种路由方案 -- **Hash**和**HTML5**，分别对应`createWebHistory`(`src/history/hash.ts`下)和`createWebHistory`(`src/history/html5.ts`下)。

接下来，我们就从这两个模式的具体实现讲起。

## createWebHistory
### 整体描述

`createWebHistory`最终返回一个`routerHistory`，它的主要流程如下：

- 利用`useHistoryStateNavigation`初始化一个导航对象`historyNavigation`。

```typescript
const historyNavigation = useHistoryStateNavigation(base);
```

- 利用`useHistoryListeners`初始化一个路由监听器`historyListeners`。

```typescript 
const historyListeners = useHistoryListeners(
    base,
    historyNavigation.state,
    historyNavigation.location,
    historyNavigation.replace,
)
```

- 封装我们熟悉的`history.go()`：

```typescript
function go(delta: number, triggerListeners = true) {
    if (!triggerListeners) historyListeners.pauseListeners()
    history.go(delta)
}
```

- 初始化我们要返回的对象(将几个对象合并)：

```typescript
const routerHistory: RouterHistory = assign(
    {
      // it's overridden right after
      location: '',
      base,
      go,
      createHref: createHref.bind(null, base),
    },
    historyNavigation,
    historyListeners,
)
```
- 利用`Object.defineProperty`, 为`routerHistory`绑定属性`location`和`state`。
这个操作无非是为调用者提供方便，我们访问`location`属性等价于`historyNavigation.location.value`,`state`属性等价于`historyNavigation.location.value`。
```typescript
Object.defineProperty(routerHistory, 'location', {
  get: () => historyNavigation.location.value,
})

Object.defineProperty(routerHistory, 'state', {
  get: () => historyNavigation.state.value,
})
```
我们对源码稍作处理, 将`routerHistory`挂载到`window`上，方便操作：
```typescript
// @ts-ignore
window.MY_HISTORY = routerHistory;
return routerHistory
```
起一个空白的H5页面，只执行上面的方法，可以看出，这些路由操作全部如期望的一样执行，上升到框架层面，无非也是对这个`routerHistory`进行各种操作，所以封装一套**通用的路由操作API**至关重要。
![](http://cdn.yuzzl.top/blog/20201107213838.png)

接下来，我们来看看`routerHistory`的一些详细的实现。

### useHistoryStateNavigation -- 路由导航操作集

上面说到`createWebHistory`利用`useHistoryStateNavigation`初始化一个导航对象`historyNavigation`，我们走进`useHistoryStateNavigation`一探究竟。

首先是一个对象解构，获得window下的`history`和`location`，他们是路由操作的核心部分。

接下来利用`createCurrentLocation`获取当前位置：
```typescript
let currentLocation: ValueContainer<HistoryLocation> = {
  value: createCurrentLocation(base, location),
}
```
`createCurrentLocation`内容如下：
```typescript
/**
 * Creates a normalized history location from a window.location object
 * 从 window.location 获取标准化的位置
 * @param base
 * @param location -
 */
function createCurrentLocation(
  base: string,
  location: Location,
): HistoryLocation {
  const { pathname, search, hash } = location
  // allows hash based url
  const hashPos = base.indexOf('#')
  if (hashPos > -1) {
    // prepend the starting slash to hash so the url starts with /#
    let pathFromHash = hash.slice(1)
    if (pathFromHash[0] !== '/') pathFromHash = '/' + pathFromHash
    return stripBase(pathFromHash, '')
  }
  const path = stripBase(pathname, base)
  return path + search + hash
}
```
这个函数的功能很简单，传入一个`base`(基础路径，这个功能主要是给`HashRouter`作准备的)和全局`location`，进行一系列字符串操作，返回一个由**路径** + **search**(就是URL中的查询参数，即?a=1之类的) + **hash**(url中#后面的值)拼接而成的字符串。
最终这个字符串会被暴露给用户，其实就是上面提到的`historyNavigation.location`。

我们继续讨论主函数，在获取当前状态之后，又对`history.state`进行了一些处理：
```typescript
let historyState: ValueContainer<StateEntry> = { value: history.state }
  // build current history entry as this is a fresh navigation
if (!historyState.value) {
    changeLocation(
        currentLocation.value,
        {
            back: null,
            current: currentLocation.value,
            forward: null,
            // the length is off by one, we need to decrease it
            position: history.length - 1,
            replaced: true,
            // don't add a scroll as the user may have an anchor and we want
            // scrollBehavior to be triggered without a saved position
            scroll: null,
        },
    true,
    )
}
```

来看看下面的`changeLocation()`, 这个函数很重要:
```typescript
function changeLocation(
  to: HistoryLocation,
  state: StateEntry,
  replace: boolean,
): void {
  // when the base has a `#`, only use that for the URL
  const hashIndex = base.indexOf('#')
  const url =
    hashIndex > -1
      ? base.slice(hashIndex) + to
      : createBaseLocation() + base + to
  try {
    // 这里对Safari浏览器的个性异常做了捕获
    // BROWSER QUIRK 
    // NOTE: Safari throws a SecurityError when calling this function 100 times in 30 seconds
    history[replace ? 'replaceState' : 'pushState'](state, '', url)
    historyState.value = state
  } catch (err) {
    if (__DEV__) {
      warn('Error with push/replace State', err)
    } else {
      console.error(err)
    }
    // Force the navigation, this also resets the call count
    location[replace ? 'replace' : 'assign'](url)
  }
}
```
可以看出`changeLocation`就是对`history.replaceState`/`history.pushState`的封装。它根据传入的`to`（目标），通过字符串拼接来获取目标路径，然后执行相应的historyAPI。同时修改了外部的`historyState`，我们可以通过查看`StateEntry`接口获取来看看它提供的更加详细的路由状态信息：
```typescript
interface StateEntry extends HistoryState {
  back: HistoryLocation | null
  current: HistoryLocation
  forward: HistoryLocation | null
  position: number
  replaced: boolean
  scroll: _ScrollPositionNormalized | null | false
}
```

可见，`useHistoryStateNavigation`首次调用`changeLocation`的目的就是初始化状态，因为默认的原生路由不会提供上面的状态信息。


回到我们的`useHistoryStateNavigation`，继续往下走，就是我们非常熟悉的API：
```typescript
function replace(to: HistoryLocation, data?: HistoryState);
function push(to: HistoryLocation, data?: HistoryState);
```
他们本质上是对`changeLocation`又做了一次封装, 并最终暴露给调用者，这里简单地讲一下具体的实现：

**push()**
```typescript
function push(to: HistoryLocation, data?: HistoryState) {
  const currentState = assign(
    {},
    historyState.value,
    history.state as Partial<StateEntry> | null,
    {
      forward: to,
      scroll: computeScrollPosition(),
    },
  )

  if (__DEV__ && !history.state) {
    // 一些错误提示文本，略去
  }

  changeLocation(currentState.current, currentState, true)

  const state: StateEntry = assign(
    {},
    buildState(currentLocation.value, to, null),
    { position: currentState.position + 1 },
    data,
  )

  changeLocation(to, state, false)
  currentLocation.value = to
}
```
- 第一步：利用`assign()`合并相关内容，获取当前状态`currentState`。
- 第二步：利用`changeLocation`改变当前状态。
- 第三步：利用`assign()`合并相关内容，获取当前状态`state`（这是最终状态）。
- 第四步：将现在的路径赋值给`currentLocation`,整个过程结束。

我们可以看到，一次`push`状态改变了两次，我们可以在控制台上打印这两个状态一探究竟：
![](http://cdn.yuzzl.top/blog/20201108132516.png)
可以看出，第一个状态可以看成一个"中间状态"，体现在`forward`字段上，第二个状态才是我们的最终状态，可以看到`current`已经变成了`hello`。

replace的过程也差不多，在此就不赘述了。

最后，`useHistoryStateNavigation`返回一个对象, 向外提供了四个API，外界通过调用它们即可实现对路由的一系列导航跳转操作。

```typescript
return {
  location: currentLocation,
  state: historyState,
  push,
  replace,
}
```
### useHistoryListeners -- 路由监听




## createWebHashHistory
这是`VueRouter`提供的第二种路由解决方案，在了解了上面的`createWebHistory`的基本流程之后，我们可以轻松写出`createWebHashHistory`,它只不过是在基础的URL之后加上了一个`#`，来看它的实现：
```typescript
export function createWebHashHistory(base?: string): RouterHistory {
  base = location.host ? base || location.pathname : ''

  if (base.indexOf('#') < 0) base += '#'

  if (__DEV__ && !base.endsWith('#/') && !base.endsWith('#')) {
    warn(
      `A hash base must end with a "#":\n"${base}" should be "${base.replace(
        /#.*$/,
        '#',
      )}".`,
    )
  }
  return createWebHistory(base)
}
```
## 总结
至此，`VueRouter`的路由核心部分已经全部分析完成，这一部分的源码中没有提到任何`Vue`的知识，只是对**原生的API进行封装**。保证了其**高可用性**。此时，我们也可以手撕一个完美的路由库了。

### 两种路由模式有什么不同？

#### hash
hash路由利用了浏览器的特性 -- hash值的变化，并不会导致浏览器向服务器发出请求，浏览器不发出请求，也就不会刷新页面：
```http
https://xxx.com/xxx/hello#helloworld
// 不变刷新页面
https://xxx.com/xxx/hello#helloworld2
```
通过监听`hashchange`事件来实现我们的目标。

hash路由对于没有主机的Web应用程序很有用。

#### history
history路由利用HTML5的`HistoryAPI`来控制状态。

history路由适合有主机的Web应用程序，由于每一个**虚拟的URL**需要对应服务端的一个地址，所以我们需要在服务端（例如nginx）进行重定向，例如在`nginx`下可以如此处理：
```nginx
location / {
  try_files $uri $uri/ /index.html;
}
```
更多的处理方案请自行阅读官方文档。

### VueRouter对底层路由管理实现的巧妙之处
`VueRouter`的`hashRouter`是基于`WebHistory`的，只是在基础url之后加了一个`#`，这一操作不仅实现了`hashRouter`的特性，同时完美利用了之前封装好的`HistoryAPI`，真可谓路由封装的最佳实践。


## 路由vuetify
在这里之前封装好的路由将被赋予`vue`的特性, 这也是`VueRouter`源码的核心部分。
