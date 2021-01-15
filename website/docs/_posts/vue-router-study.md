---
top: true

date: 2020-12-17

tags:

- Vue
- 源码解读

---

# vue-router-next 源码解析

[[toc]]

## 总述

单页面应用可以做到**页面跳转的不刷新**，而实现这一功能的核心在于前端路由的处理。

实际上，前端路由的核心无非就是下面的两点：

- 改变 url，页面**不刷新**。
- 改变 url 时，我们可以**监听**到路由的变化并能够做出一些处理（如更新 DOM）。

本文的源码解读基于 `vue-router-next 4.0.1`，于 12.7 发布。

## 路由核心

我们现在暂时抛开 `Vue` 这个框架，想想如何使用**原生 JS** 实现一个路由管理工具，如此一来，任何 router 库无非就是在这个基础上进行扩展，让其适应自身的框架，这便是一种**封装**
思想的体现，我们现在讨论的 `VueRouter` 就是如此做的, 来看下图（来自官方文档）：

<a data-fancybox title="" href="http://cdn.yuzzl.top/blog/20201107205145.png">![](http://cdn.yuzzl.top/blog/20201107205145.png)</a>

可以发现，两种模式分别对应我们前面提到的两种路由方案：

- **Html5 History**，对应 `createWebHistory`，位于 `src/history/html5.ts` 下。
- **Hash**，对应 `createWebHashHistory`，位于 `src/history/hash.ts` 下。

接下来，我们就从这两个模式的具体实现讲起。

### createWebHistory

`createWebHistory` 最终返回一个 `routerHistory`，它的主要流程如下：

- 利用 `useHistoryStateNavigation` 初始化一个导航对象 `historyNavigation`。

```typescript
const historyNavigation = useHistoryStateNavigation(base);
```

- 利用 `useHistoryListeners` 初始化一个路由监听器 `historyListeners`。

```typescript 
const historyListeners = useHistoryListeners(
    base,
    historyNavigation.state,
    historyNavigation.location,
    historyNavigation.replace,
)
```

- 封装浏览器的 `history.go()` 方法，默认绑定了监听器（Listeners）的触发功能：

```typescript
function go(delta: number, triggerListeners = true) {
  if (!triggerListeners) historyListeners.pauseListeners()
  history.go(delta)
}
```

- 初始化我们要返回的对象（将 `historyNavigation`、`historyListeners` 、`go` 等接口合并，向外暴露）：

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

- 利用`Object.defineProperty`, 为 `routerHistory` 绑定属性 `location` 和 `state`。 这个操作无非是为调用者提供方便，我们访问 `location`
  属性等价于 `historyNavigation.location.value`, `state` 属性等价于 `historyNavigation.location.value`。

```typescript
Object.defineProperty(routerHistory, 'location', {
  get: () => historyNavigation.location.value,
})

Object.defineProperty(routerHistory, 'state', {
  get: () => historyNavigation.state.value,
})
```

来实践一下。我们对源码稍作处理, 将`routerHistory`挂载到`window`上，方便操作：

```typescript
window.MY_HISTORY = routerHistory;
```

起一个空白的H5页面，只执行上面的方法，可以看出，这些路由操作全部如期望的一样执行，上升到框架层面，无非也是对这个 `routerHistory` 进行各种操作，例如让它变成响应式的，所以由此可见，封装一套**通用的路由操作API**
至关重要。

<a data-fancybox title="" href="http://cdn.yuzzl.top/blog/20201107213838.png">![](http://cdn.yuzzl.top/blog/20201107213838.png)</a>

接下来，我们来看看 `routerHistory` 的一些详细的实现。

### useHistoryStateNavigation -- 路由导航操作集

上面说到 `createWebHistory` 利用 `useHistoryStateNavigation` 初始化一个导航对象 `historyNavigation`，我们走进 `useHistoryStateNavigation`
一探究竟。

首先是一个对象解构，获得 window 下的 `history` 和 `location` ，他们是路由操作的核心部分。

```typescript
const {history, location} = window
```

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
  const {pathname, search, hash} = location
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

这个函数的功能很简单，传入一个 `base` 和全局 `location`，进行一系列字符串操作，返回一个由**路径**、**search**(
就是URL中的查询参数，即?a=1之类的) + **hash**（url 中#后面的值）拼接而成的字符串。

最终这个字符串会被暴露给用户，其实就是上面提到的 `historyNavigation.location`。

我们继续讨论主函数，在获取当前状态之后，又对 `history.state` 进行了一些处理：

```typescript
let historyState: ValueContainer<StateEntry> = {value: history.state}
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

定义了 `changeLocation()`:

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
    // 这里对 Safari 浏览器的个性异常做了捕获
    history[replace ? 'replaceState' : 'pushState'](state, '', url)
    historyState.value = state
  } catch (err) {
    // 异常处理，略去

    // 异常状态下的强制导航
    location[replace ? 'replace' : 'assign'](url)
  }
}
```

可以看出`changeLocation`就是对 `history.replaceState` / `history.pushState` 的封装。

它根据传入的 `to`（目标），通过字符串拼接来获取目标路径，然后执行相应的 **historyAPI**。同时修改了外部的 `historyState`。

我们可以通过 `StateEntry` 获取来看看它提供的更加详细的路由状态信息：

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

可见，`useHistoryStateNavigation` 首次调用 `changeLocation` 的目的就是初始化状态，因为默认的原生路由不会提供上面的状态信息。

回到我们的 `useHistoryStateNavigation`，继续往下走，就是我们非常熟悉的API：

```typescript
function replace(to: HistoryLocation, data?: HistoryState) {
  // code....
}

function push(to: HistoryLocation, data?: HistoryState) {
  // code....
}
```

他们本质上是对 `changeLocation` 又做了一次封装, 并最终暴露给调用者，这里简单地讲一下 `push()` 的实现：

```typescript
function push(to: HistoryLocation, data?: HistoryState) {
  // 1
  const currentState = assign(
    {},
    historyState.value,
    history.state as Partial<StateEntry> | null,
    {
      forward: to,
      scroll: computeScrollPosition(),
    },
  )

  // 2
  changeLocation(currentState.current, currentState, true)

  // 3
  const state: StateEntry = assign(
    {},
    buildState(currentLocation.value, to, null),
    {position: currentState.position + 1},
    data,
  )

  // 4
  changeLocation(to, state, false)
  // 5
  currentLocation.value = to
}
```

- 第一步：利用 `assign()` 最终得到当前路由状态 `currentState`。
- 第二步：利用 `changeLocation()` 改变当前状态。
- 第三步：利用 `assign()` 合并相关内容，获取当前状态 `state`（这是最终状态）。
- 第四步：利用 `changeLocation()` 再次改变当前状态。
- 第五步：将现在的路径赋值给 `currentLocation`，整个过程结束。

我们可以看到，一次 `push` 状态改变了两次，我们可以在控制台上打印这两个状态一探究竟：

<a data-fancybox title="" href="http://cdn.yuzzl.top/blog/20201108132516.png">![](http://cdn.yuzzl.top/blog/20201108132516.png)</a>

可以看出，第一个状态可以看成一个"中间状态"，体现在 `forward` 字段上，第二个状态才是我们的最终状态，可以看到 `current` 已经变成了`hello`。

这种中间状态的意义很明显。从上图我们可以看到这个中间态的具体内容，一个对象包含了两份信息 -- 当前状态和将要跳转的状态（forward）， 如果需要实现路由守卫之类的功能、权限控制之类的功能，这种细粒度的路由状态将变得非常有意义。

`replace()` 的过程也差不多，在此就不赘述了。

最后，`useHistoryStateNavigation` 返回一个对象, 向外提供了 `location`、`state`、`push`、`pop`，外界通过调用它们即可实现对路由的一系列导航跳转操作。

```typescript
return {
  location: currentLocation,
  state: historyState,
  push,
  replace,
}
```

### useHistoryListeners -- 路由监听

前面我们已经实现了路由的切换，光有切换还不够，我们还需要监听，也就是我们开头说到的第二个核心功能。

`useHistoryListeners()` 就是来满足这个需求的，它最终暴露三个接口：

```typescript
return {
  // 关闭监听功能
  pauseListeners,
  // 添加监听者（订阅者）
  listen,
  // 销毁监听器
  destroy,
}
```

首先，执行这个函数会使用 `addEventListener()` 来监听 `popstate` 和 `beforeunload` 事件：

```typescript
window.addEventListener('popstate', popStateHandler)
window.addEventListener('beforeunload', beforeUnloadListener)
```

当用户点击浏览器的回退按钮（或者在Javascript代码中调用 `history.back()` 或者 `history.forward()` 方法，都会触发 `popState` 事件，从而执行 `popStateHandler`：

这个回调函数能够接收到很多属性，这里利用了对象解构，取到 `state` 属性（当前状态），然后做出一系列处理（看注释）：

```typescript
let pauseState: HistoryLocation | null = null
const popStateHandler: PopStateListener = ({state}: { state: StateEntry | null }) => {
  const to = createCurrentLocation(base, location)
  const from: HistoryLocation = currentLocation.value
  const fromState: StateEntry = historyState.value
  let delta = 0

  if (state) {
    // 修改当前位置
    currentLocation.value = to
    // 修改当前状态
    historyState.value = state

    // pauseState 是用来处理路由暂停的，
    if (pauseState && pauseState === from) {
      pauseState = null
      return
    }
    // 通过计算 position 差来计算路由跳转的间距
    delta = fromState ? state.position - fromState.position : 0
  } else {
    replace(to)
  }

  // 遍历注册的监听（订阅者），执行监听函数，并传入一系列参数，例如跳转类型，位置等
  listeners.forEach(listener => {
    listener(currentLocation.value, from, {
      delta,
      type: NavigationType.pop,
      direction: delta
        ? delta > 0
          ? NavigationDirection.forward
          : NavigationDirection.back
        : NavigationDirection.unknown,
    })
  })
}
```

如何添加监听者？我们需要用到 `listen()`，通过调用它，并传入 `callback` 即可实现监听， 结合上面的 `listener.forEach()`，可以发现是一个典型的**发布订阅模式**。

```typescript
function listen(callback: NavigationCallback) {
  // 设置监听器并准备销毁回调
  listeners.push(callback)

  // 销毁回调
  const teardown = () => {
    const index = listeners.indexOf(callback)
    if (index > -1) listeners.splice(index, 1)
  }

  // 向 `teardowns` 中插入销毁回调，
  // 在销毁方法被执行之后，我们会遍历这个数组，然后调用这个回调函数，通过 `splice` 来移除
  teardowns.push(teardown)
  return teardown
}
```

### createWebHashHistory

这是 `VueRouter` 提供的第二种路由解决方案，在了解了上面的 `createWebHistory` 的基本流程之后，我们可以轻松写出 `createWebHashHistory` ,它只不过是在基础的URL之后加上了一个`#`
，来看它的实现：

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

## PART 1 总结

至此，`VueRouter` 的路由核心部分已经全部分析完成，这一部分的源码中没有提到任何 `Vue` 的知识，只是对**原生的API进行封装**。保证了其**高可用性**。此时，我们也可以手撕一个比较完美的路由基础库了。

两种路由模式有什么不同？ hash路由利用了浏览器的特性：hash 值的变化并不会导致浏览器向服务器发出请求，浏览器不发出请求，也就不会刷新页面：

```
// 不会刷新页面
https://xxx.com/xxx/hello#helloworld  ===> https://xxx.com/xxx/hello#helloworld2
```

之后，通过主动跳转或者监听 `hashchange` 事件即可实现我们的目标（如 DOM 的替换），hash 路由对于没有主机的 Web 应用程序很有用。

history 路由利用 HTML5 的 `History`API 来控制状态，它适合有主机的 Web 应用程序，由于每一个**虚拟的 URL** 需要对应服务端的一个地址，所以我们需要在服务端进行重定向，例如在 **nginx**
下可以如此处理：

```nginx
location / {
  try_files $uri $uri/ /index.html;
}
```

更多的处理方案请自行阅读[官方文档 -- Example Server Configurations](https://next.router.vuejs.org/guide/essentials/history-mode.html#example-server-configurations)。

`VueRouter` 的 `hashRouter` 是基于 `WebHistory` 的，只是在基础url之后加了一个 `#` ，这一操作不仅实现了 `hashRouter` 的特性，同时完美利用了之前封装好的 `HistoryAPI`。

## 路由vuetify

在这里，之前封装好的一套路由 API 将被赋予 `vue` 的特性, 这也是 `VueRouter` 源码的核心部分。主要的代码位于 `src/router.ts`
下，下面展示一个 DEMO 代码（来自官网），来回顾一下 `VueRouter` 是如何使用的。

```javascript
//第一步：定义路由组件
const Home = {template: '<div>Home</div>'}
const About = {template: '<div>About</div>'}

//第二步：定义路由表
const routes = [
  {path: '/', component: Home},
  {path: '/about', component: About},
]

//第三步：初始化路由
const router = VueRouter.createRouter({
  // 第四步：设置路由的模式
  history: VueRouter.createWebHashHistory(),
  routes: routes
})

//第五步：初始化vue
const app = Vue.createApp({})

app.use(router)

app.mount('#app')
```

我们介绍的重点在第三步，我们从 `createRouter()` 起手来分析其原理。

### 路由初始化

`createRouter()` 用来创建供Vue应用程序使用的Router实例。它返回一个 `router` 对象，里面就是我们熟悉的一系列 `vue-router` API：

<a data-fancybox title="" href="http://cdn.yuzzl.top/blog/20201114190252.png">![](http://cdn.yuzzl.top/blog/20201114190252.png)</a>

#### 整体过程

去除函数定义，`createRouter` 的过程如下所示，仅保留主干部分：

```typescript
export function createRouter(options: RouterOptions): Router {
  // 1.初始化路由matcher，可以把它看成“路由管理器”，我们可以通过它来动态添加路由、删除路由等操作
  const matcher = createRouterMatcher(options.routes, options)

  // 2.获取路由核心 API（hash 或者 History）
  let routerHistory = options.history

  // 3.利用useCallbacks()初始化路由前置守卫/解析守卫/后置守卫
  const beforeGuards = useCallbacks<NavigationGuardWithThis<undefined>>()
  const beforeResolveGuards = useCallbacks<NavigationGuardWithThis<undefined>>()
  const afterGuards = useCallbacks<NavigationHookAfter>()

  // 4.当前路由，注意这里和 vue3.0 结合了，使用了 shallowRef 这个API，做到了响应式路由
  const currentRoute = shallowRef<RouteLocationNormalizedLoaded>(
    START_LOCATION_NORMALIZED,
  )


  const router: Router = {
    // 6. 准备挂载到全局vueApp上，这是vuejs提供的插件功能，之后这个函数会被vue调用
    install(app: App) {
      // 省略，后面会提到
    },
    // 7. 省略其他暴露的API，可见上图
  }
  return router
}
```

`createRouterMatcher` 提供了一系列接口，返回一个 `matcher`，它是一个对象，可以用来配置路由匹配、动态路由。

在讲细节之前我们需要明确几个概念：

- 路由配置：用户传入的路由配置信息，即全局配置中的 `routes` 属性的一个元素：

```typescript
const r = {
  path: '路径',
  name: '名称',
  component,
  beforeEnter(to, from, next) {
    //.....
  }
}
```

- **当前路由信息**（currentRoute）：当前所处的路径的一些数据信息：

<a data-fancybox title="" href="http://cdn.yuzzl.top/blog/20201217124529.png">![](http://cdn.yuzzl.top/blog/20201217124529.png)</a>

- **匹配到的路由**（matched）：传入当前路由，通过 matcher 来匹配到的一个或者多个路由信息，拿到匹配到的路由，我们就可以渲染其对应的组件：

<a data-fancybox title="" href="http://cdn.yuzzl.top/blog/20201217124838.png">![](http://cdn.yuzzl.top/blog/20201217124838.png)</a>

- 路由匹配器（RouteRecordMatcher）：它是一个对象，他主要维护一个正则语句和与其匹配的路由信息（recode）。

下图是路由匹配宏观的的过程：

<a data-fancybox title="" href="http://cdn.yuzzl.top/blog/20201217140746.png">![](http://cdn.yuzzl.top/blog/20201217140746.png)</a>

#### createRouterMatcher -- 初始化路由 matcher

```typescript
const matcher = createRouterMatcher(options.routes, options)
```

首先利用 `createRouterMatcher()` 初始化了 `matcher` 变量，这个函数返回值如下, 可以看出是路由处理的一套API，部分向外暴露给用户（可以对比一下本节的第一张图片），如 `addRoute`：

```typescript
return {
  // 添加一个路由
  addRoute,
  // 获取路径（记录）相匹配的路由，这也是路由匹配的核心方法
  resolve,
  // 移除一个路由2、
  removeRoute,
  // 获取所有的 matcher
  getRoutes,
  // 从路由匹配映射表中获取某个路径匹配的路由
  getRecordMatcher
}
```

`createRouterMatcher()` 基于上述的 API，核心是维护了 `matchers` 这个数组，全局所有的匹配器都包含在内。

结合调试工具，来看一下这两个数据，下面是我们的路由结构：

```typescript
it("yzl test", () => {
  const matcher = createRouterMatcher([{
    path: "/",
    component,
    name: "home",
    children: [
      {
        path: "one",
        component,
        children: [
          {
            path: "two",
            component
          }
        ]
      }
    ]
  }], {});
  expect(matcher).toStrictEqual([]);
});
```

其生成的匹配器数组和映射表如图所示（是通过 `addRoute` 实现的，后面会说）：

<a data-fancybox title="" href="http://cdn.yuzzl.top/blog/20201217174201.png">![](http://cdn.yuzzl.top/blog/20201217174201.png)</a>

可以看出，对于每个路由配置，都会有相应的 `matcher` 和它匹配（通过正则表达式），例如，我们的路径是 `one/two`，那么可以匹配到上图的**第一项**。

来看看 `resolve` 方法，它通过传入当前路径配置，拿到匹配的路由组件，只保留主干部分代码：

```typescript
function resolve(
  location: Readonly<MatcherLocationRaw>,
  currentLocation: Readonly<MatcherLocation>
): MatcherLocation {
  let matcher: RouteRecordMatcher | undefined
  let params: PathParams = {}
  let path: MatcherLocation['path']
  let name: MatcherLocation['name']

  // 拿到 path
  path = location.path

  // 从 matchers 数组中拿到匹配的路由 matcher ，这里的匹配使用了正则
  matcher = matchers.find(m => m.re.test(path))

  const matched: MatcherLocation['matched'] = []
  let parentMatcher: RouteRecordMatcher | undefined = matcher
  while (parentMatcher) {
    // 遍历匹配到的 matcher，依次加入数组，
    // 注意，越接近路由表的根部越靠前
    matched.unshift(parentMatcher.record)
    // 指向其父亲，类似于链表的结构
    // 对于这个 matched 不熟悉的可以去回顾一下前面的代码
    parentMatcher = parentMatcher.parent
  }

  return {
    name,
    path,
    params,
    matched,
    meta: mergeMetaFields(matched),
  }
}
```

然后是 `removeRoute` 方法，支持传入路由名称或者一个路由匹配器：

```typescript
function removeRoute(matcherRef: RouteRecordName | RouteRecordMatcher) {
  if (isRouteName(matcherRef)) {
    // 从路由匹配映射表中找到目标路由的匹配器
    const matcher = matcherMap.get(matcherRef)
    if (matcher) {
      // 如果找到了，从映射表、匹配器数组中删除之
      matcherMap.delete(matcherRef)
      matchers.splice(matchers.indexOf(matcher), 1)

      // 以同样的方法递归地处理孩子
      matcher.children.forEach(removeRoute)
      matcher.alias.forEach(removeRoute)
    }
  } else {
    // 如果是路由匹配器，也是一样的道理
    let index = matchers.indexOf(matcherRef)
    if (index > -1) {
      matchers.splice(index, 1)
      if (matcherRef.record.name) matcherMap.delete(matcherRef.record.name)
      matcherRef.children.forEach(removeRoute)
      matcherRef.alias.forEach(removeRoute)
    }
  }
}
```

很明显，这个方法会在监听到路由改变 / 主动切换路由时被执行。

问题来了，这个 `matchers` 数组是怎么来的？这里就要介绍 `addRoute()` 方法了，`addRoute()` 递归处理一条路由记录，生成匹配器数组和路由表：

```typescript
function addRoute(
  record: RouteRecordRaw,
  parent?: RouteRecordMatcher,
  originalRecord?: RouteRecordMatcher
) {
  let isRootAdd = !originalRecord
  // 规范化路由信息，例如把一些 undefined 的属性用默认值进行填充
  let mainNormalizedRecord = normalizeRouteRecord(record)

  // 合并选项
  const options: PathParserOptions = mergeOptions(globalOptions, record)
  const normalizedRecords: typeof mainNormalizedRecord[] = [
    mainNormalizedRecord,
  ]

  let matcher: RouteRecordMatcher
  let originalMatcher: RouteRecordMatcher | undefined

  // 遍历路由记录
  for (const normalizedRecord of normalizedRecords) {
    // 拿到当前路径
    let {path} = normalizedRecord

    // 创建匹配器
    matcher = createRouteRecordMatcher(normalizedRecord, parent, options)

    // 如果当前路由已经存在了，删除旧的（例如 我们有 /home 然后又添加了一个 /home，我们会删除旧的）
    if (isRootAdd && record.name && !isAliasRecord(matcher))
      removeRoute(record.name)

    // 递归地处理孩子
    if ('children' in mainNormalizedRecord) {
      let children = mainNormalizedRecord.children
      for (let i = 0; i < children.length; i++) {
        addRoute(
          children[i],
          matcher,
          originalRecord && originalRecord.children[i]
        )
      }
    }
    // 将获取的匹配器插入全局 matcher 中，为后续匹配做准备
    insertMatcher(matcher)
  }
  // 返回一个移除路由的方法，方便将其删除
  return () => removeRoute(originalMatcher);
}
```

在 `createRouteMatcher()` 中，遍历用户传入的路由表，依次调用上面的方法即可：

```typescript
routes.forEach(route => addRoute(route));
```

#### 初始化路由守卫

三种路由守卫都通过 `useCallbacks<T>()` 来初始化，可以看出它利用了闭包，`handlers: T[]` 是存储用户注册的守卫函数的地方:

```javascript
export function useCallbacks<T>() {
  let handlers: T[] = []

  function add(handler: T): () => void {
    handlers.push(handler)
    return () => {
      const i = handlers.indexOf(handler)
      if (i > -1) handlers.splice(i, 1)
    }
  }

  function reset() {
    handlers = []
  }

  return {
    add,
    list: () => handlers,
    reset,
  }
}
```

这个函数被调用之后返回一个对象，并且，`add` 会在 `createRouter()` 主函数中作为我们熟悉的 `beforeEach` 等API暴露给调用者：

<a data-fancybox title="" href="http://cdn.yuzzl.top/blog/image-20201115122627609.png">![](http://cdn.yuzzl.top/blog/image-20201115122627609.png)</a>

`add` 用来注册守卫，`reset` 清空守卫，`list` 是一个函数，返回 `handlers` 数组，在相应的时机 `vue-router` 会遍历调用之。

#### 当前路由 -- currentRoute

这是响应式路由的核心，其中常量 `START_LOCATION_NORMALIZED` 为默认路由（`/`）：

```typescript
export const START_LOCATION_NORMALIZED: RouteLocationNormalizedLoaded = {
  path: '/',
  name: undefined,
  params: {},
  query: {},
  hash: '',
  fullPath: '/',
  matched: [],
  meta: {},
  redirectedFrom: undefined,
}

const currentRoute = shallowRef<RouteLocationNormalizedLoaded>(START_LOCATION_NORMALIZED)
```

使用vue的**响应式API** `shallowRef` 处理 `currentRoute` 使其成为响应式的元素，一旦它改变就会触发视图的更新。

可参考官方文档：https://v3.vuejs.org/api/refs-api.html#shallowref

#### install -- 向vue添加全局功能

这是 `vue` **插件机制**的体现，其文档如此介绍插件机制：

插件是自包含的代码，通常向 Vue 添加全局级功能。它可以是公开 `install()` 方法的 `object`，也可以是 `function`

插件的功能范围没有严格的限制——一般有下面几种：

1. 添加全局方法或者 property。如：[vue-custom-element](https://github.com/karol-f/vue-custom-element)
2. 添加全局资源：指令/过滤器/过渡等。如：[vue-touch](https://github.com/vuejs/vue-touch)
3. 通过全局混入来添加一些组件选项。如[vue-router](https://github.com/vuejs/vue-router)
4. 添加全局实例方法，通过把它们添加到 `config.globalProperties` 上实现。
5. 一个库，提供自己的 API，同时提供上面提到的一个或多个功能。如 [vue-router](https://github.com/vuejs/vue-router)

##### 代码分析

来看`install`部分的代码：

```typescript
let started: boolean | undefined
// app集合，一个网页可能注册了多个VueApp
const installedApps = new Set<App>();
const router = {
  install(app: App) {
    // 获取路由对象
    const router = this

    // 通过全局混入来添加一些组件选项，如我们熟悉的 RouterLink、RouterView
    app.component('RouterLink', RouterLink)
    app.component('RouterView', RouterView)

    // 添加全局实例方法：router，使用者可以通过 $router 来获取 vuerouter 对象
    app.config.globalProperties.$router = router

    // 劫持上面的全局实例方法
    // 通过unref之后的currentRoute是普通的对象而不是响应式对象
    // 便于调用者二次处理
    Object.defineProperty(app.config.globalProperties, '$route', {
      get: () => unref(currentRoute),
    })

    // 创建初始导航，上面说过，默认的当前路由为 “/”，但是如果用户输入了 “/hello”，便不是 “/"了，所以我们要初始化一次
    if (
      isBrowser &&
      !started &&
      currentRoute.value === START_LOCATION_NORMALIZED
    ) {
      started = true
      // 调用push方法，实现路由跳转，ps:由于他是初始路由，其实最终是调用了replace
      push(routerHistory.location).catch(err => {
        // 异常处理，省略
      })
    }

    const reactiveRoute = {} as {
      [k in keyof RouteLocationNormalizedLoaded]: ComputedRef<RouteLocationNormalizedLoaded[k]>
    }
    for (let key in START_LOCATION_NORMALIZED) {
      reactiveRoute[key] = computed(() => currentRoute.value[key])
    }

    // provide 可向根组件中注入一个 property，
    // 值得注意的是这里的 routerKey、routerViewLocationKey 
    // 都是 es6 的 Symbol 类型，有效防止了成员变量的命名冲突
    app.provide(routerKey, router)
    app.provide(routeLocationKey, reactive(reactiveRoute))
    app.provide(routerViewLocationKey, currentRoute)

    // 覆写全局组件的 unmount 方法（先使用 unmountApp 指向 app.unmount），然后重写 app.unmount，之后执行 app 的 unmountApp
    let unmountApp = app.unmount

    // 这应该是考虑一个页面多个vue全局实例的情况，installedApps是一个set，每一个app创建时就会向集合中添加它（的引用）
    installedApps.add(app)
    app.unmount = function () {
      // 一旦某个app实例注销，那么会从app集合中移除
      installedApps.delete(app)

      // 如果app集合为空，说明全部实例都已注销，
      // 于是我们需要及时移除路由的监听，同时重置当前路由
      if (installedApps.size < 1) {
        removeHistoryListener()
        currentRoute.value = START_LOCATION_NORMALIZED
        started = false
        ready = false
      }
      // 执行vue实例的注销方法
      unmountApp.call(this, arguments)
    }
    // 针对 vue-devtools 的处理，略去
  }
}
```

### 路由跳转

上面提到了 `createRouter()` 暴露了很多 API，关于路由跳转接口有这些：

- `push()`
- `replace()`
- `pop()`
- `back()`
- `forward()`

其中 `back`，`forward` 其实就是 `go(±1)`。 对于 `push` 和 `replace` 请看下面代码：

```typescript
function push(to: RouteLocationRaw | RouteLocation) {
  return pushWithRedirect(to)
}

function replace(to: RouteLocationRaw | RouteLocationNormalized) {
  return push(assign(locationAsObject(to), {replace: true}))
}
```

可以看出他们本质上都是调用了`pushWithRedirect`，只不过后者多了 `{replace: true}` 下面我们来看看 `pushWithRedirect`。

#### pushWithRedirect -- 路由跳转的核心

下面结合代码注释描述一下 `pushWithRedirect` 的过程，具体细节的方法会单独提及。

```typescript
function pushWithRedirect(
  to: RouteLocationRaw | RouteLocation,
  redirectedFrom?: RouteLocation,
): Promise<NavigationFailure | void | undefined> {

  // 使用 resolve 解析目标路由，同时更新 pendingLocation（可以视为等待路由或者过渡路由）
  const targetLocation: RouteLocation = (pendingLocation = resolve(to))

  // 记录当前路由
  const from = currentRoute.value

  // 携带的数据
  const data: HistoryState | undefined = (to as RouteLocationOptions).state

  // 是否强制跳转
  const force: boolean | undefined = (to as RouteLocationOptions).force

  // 是否为replace跳转，如果是通过replace调用的，那么传入的to路由会加入 { replace: true }
  const replace = (to as RouteLocationOptions).replace === true

  // 是否需要重定向
  const shouldRedirect = handleRedirectRecord(targetLocation)

  // 如果需要重定向，递归调用 pushWithRedirect 直至无重定向为止
  if (shouldRedirect) {
    return pushWithRedirect(
      assign(shouldRedirect, {state: data, force, replace}),
      redirectedFrom || targetLocation,
    )
  }

  // 如果是来自重定向的，执行如果到了这里就是最终的路由，未来不会再重定向
  const toLocation = targetLocation as RouteLocationNormalized

  // 记录重定向来源
  toLocation.redirectedFrom = redirectedFrom

  // 错误对象，下面的可能发生的错误都会赋值给他，最后它会被统一处理
  let failure: NavigationFailure | void | undefined

  // 如果不是强制跳转，但是是相同的路由，
  // 我们就会产生一个错误并交给 failure 变量，到后面统一处理
  if (!force && isSameRouteLocation(stringifyQuery, from, targetLocation)) {
    failure = createRouterError<NavigationFailure>(
      ErrorTypes.NAVIGATION_DUPLICATED,
      {to: toLocation, from},
    )
  }

  // 最终我们返回一个promise，
  // 1.首先判断之前的操作是否出现错误，
  // 1.1 如果一切正常，我们调用 navigate() 方法，传入相应的路由参数执行跳转
  //     如果执行跳转失败，则走到下面的catch，成功则走到下面的then

  // 1.2 如果出现了错误，那么我们resolve一个promise，走到了下面的then
  return (failure ? Promise.resolve(failure) : navigate(toLocation, from))
    .catch((error: NavigationFailure | NavigationRedirectError) =>
      isNavigationFailure(error)
        ? error
        : // 处理未知错误
        triggerError(error),
    )
    // 上面的navigate执行跳转成功，以及failure有值都会走到这个回调，
    // 我们只要根据failure的值进行对应的处理即可
    .then((failure: NavigationFailure | NavigationRedirectError | void) => {
      if (failure) {
        // 一系列错误判断和警告，略去不表
        // ........
        // 最后我们调用 pushWithRedirect 执行跳转失败的重定向，重定向的配置和错误的类型有关
        return pushWithRedirect(
          assign(locationAsObject(failure.to), {
            state: data,
            force,
            replace,
          }),
          redirectedFrom || toLocation,
        )
      } else {
        // 完成导航，在这里我们实现了路由的真正跳转，执行完之后，浏览器的URL会发生相应的变化
        failure = finalizeNavigation(
          toLocation as RouteLocationNormalizedLoaded,
          from,
          true,
          replace,
          data,
        )
      }
      // 路由跳转结束的操作，在这里 afterEach 守卫将被遍历并执行，具体的代码略去，请自行查看
      triggerAfterEach(
        toLocation as RouteLocationNormalizedLoaded,
        from,
        failure,
      )
      return failure
    })
}
```

#### navigate -- 执行路由导航

如果 `pushWithRedirect` 的主要过程没有出现错误，也就是说 `failure` 为 `undefined` ，那么就会执行 `navigate`。

navigate 函数需要我们传入目标路由 `to` 和 起始路由 `from`：

```typescript
 function navigate(
  to: RouteLocationNormalized,
  from: RouteLocationNormalizedLoaded
): Promise<any> {
  // ......
}
```

首先，传入 `to` 和 `from`， 通过执行 `extractChangingRecords` 提取本次路由跳转的信息：

```typescript
const [
  leavingRecords,
  updatingRecords,
  enteringRecords,
] = extractChangingRecords(to, from)
```

`extractChangingRecords()` 的主要功能是遍历 `to` 、`form` 匹配（`match`）的所有路由组件，然后加入到相应的数组中：

```typescript
function extractChangingRecords(
  to: RouteLocationNormalized,
  from: RouteLocationNormalizedLoaded
) {
  const leavingRecords: RouteRecordNormalized[] = []
  const updatingRecords: RouteRecordNormalized[] = []
  const enteringRecords: RouteRecordNormalized[] = []

  const len = Math.max(from.matched.length, to.matched.length)
  for (let i = 0; i < len; i++) {
    // from 匹配的路由组件
    const recordFrom = from.matched[i]
    if (recordFrom) {
      // 如果这个组件在to中没有出现，那么将 recordFrom 放入 leavingRecords，否如果再次出现了，则放到 updatingRecords
      if (to.matched.indexOf(recordFrom) < 0) leavingRecords.push(recordFrom)
      else updatingRecords.push(recordFrom)
    }
    // 如果 to 的组件不再 from 里面出现，那么是新出现的，我们放到 enteringRecords 里面
    const recordTo = to.matched[i]
    if (recordTo) {
      if (from.matched.indexOf(recordTo as any) < 0)
        enteringRecords.push(recordTo)
    }
  }
  return [leavingRecords, updatingRecords, enteringRecords]
}
```

接着执行 `extractComponentsGuards` ，通过传入上面的 `record` 和守卫 type，以提取相应的路由守卫赋值给 `guards`，另外，路由**异步组件**也会在这里被处理：

```typescript
guards = extractComponentsGuards(
  leavingRecords.reverse(),
  "beforeRouteLeave",
  to,
  from
);
```

这里被处理的是 `beforeRouteLeave` 守卫。

来看 `extractComponentsGuards`，略去了一些错误处理：

```typescript
export function extractComponentsGuards(
  matched: RouteRecordNormalized[],
  guardType: GuardType,
  to: RouteLocationNormalized,
  from: RouteLocationNormalizedLoaded
) {
  const guards: Array<() => Promise<void>> = []

  // 遍历传入的 matched，也就是匹配的路由
  for (const record of matched) {
    // 接着遍历 所有components
    for (const name in record.components) {

      // 拿到 rawComponent
      let rawComponent = record.components[name]

      // 如果它是一个合法的 vue 组件，
      // isRouteComponent 合法的条件是 component 为 object 类型，且拥有 displayName、props、__vccOpts 属性
      if (isRouteComponent(rawComponent)) {

        // 通过传入的 guardType 拿到 guard，并加入 guard 数组中
        const guard = options[guardType]
        guard && guards.push(guardToPromiseFn(guard, to, from, record, name))

      } else {
        // 如果他不是一个合法的组件，例如一个函数 () => import(.....)，
        // 没错，你想到了懒加载模式（异步路由），
        // 这个 import 在底层的实现就是一个 promise ，执行它
        let componentPromise: Promise<RouteComponent | null | undefined | void> = (rawComponent as Lazy<RouteComponent>)()

        // 将这个 promise 的 then 回调 加入到 guards 中
        guards.push(() =>
          componentPromise.then(resolved => {
            const resolvedComponent = isESModule(resolved)
              ? resolved.default
              : resolved
            // 如果解析成功，我们将旧的 component （上面说了，是个异步函数）替换成我们解析的组件
            record.components[name] = resolvedComponent

            // 然后拿到相应的 guard
            const guard: NavigationGuard = resolvedComponent[guardType]

            // 这个 guard 会在之后的 runGuard 里面被执行
            return guard && guardToPromiseFn(guard, to, from, record, name)()
          })
        )
      }
    }
  }
  return guards
}
```

然后，我们处理 `leavingRecords` 的 `leaveGuards` 守卫：

```typescript
 for (const record of leavingRecords) {
  record.leaveGuards.forEach(guard => {
    guards.push(guardToPromiseFn(guard, to, from));
  });
}
```

最终返回一个 `promise` 链，结合注释来看源码：

```typescript
return (
  // 调用离开组件的 `beforeRouteLeave` 守卫
  runGuardQueue(guards)
    .then(() => {
      guards = []
      for (const guard of beforeGuards.list()) {
        guards.push(guardToPromiseFn(guard, to, from))
      }
      guards.push(canceledNavigationCheck)

      // 调用全局的 `beforeEach` 守卫
      return runGuardQueue(guards)
    })
    .then(() => {
      guards = extractComponentsGuards(
        updatingRecords,
        'beforeRouteUpdate',
        to,
        from
      )
      for (const record of updatingRecords) {
        record.updateGuards.forEach(guard => {
          guards.push(guardToPromiseFn(guard, to, from))
        })
      }
      guards.push(canceledNavigationCheck)

      // 调用复用组件内部的 `beforeRouteUpdate` 守卫
      return runGuardQueue(guards)
    })
    .then(() => {
      guards = []
      for (const record of to.matched) {
        if (record.beforeEnter && from.matched.indexOf(record as any) < 0) {
          if (Array.isArray(record.beforeEnter)) {
            for (const beforeEnter of record.beforeEnter)
              guards.push(guardToPromiseFn(beforeEnter, to, from))
          } else {
            guards.push(guardToPromiseFn(record.beforeEnter, to, from))
          }
        }
      }
      guards.push(canceledNavigationCheck)
      // 调用目标组件的 `beforeEnter` 守卫
      return runGuardQueue(guards)
    })
    .then(() => {
      guards = extractComponentsGuards(
        enteringRecords,
        'beforeRouteEnter',
        to,
        from
      )
      guards.push(canceledNavigationCheck)

      // 调用目标组件内部的 `beforeRouteEnter` 守卫
      return runGuardQueue(guards)
    })
    .then(() => {
      guards = []
      for (const guard of beforeResolveGuards.list()) {
        guards.push(guardToPromiseFn(guard, to, from))
      }
      guards.push(canceledNavigationCheck)
      // 调用全局的 beforeResolve 守卫
      return runGuardQueue(guards)
    })
  // 如果上述操作有异常，会在最后的 `catch()` 回调中被捕获到，这里略去
)
```

`navigate()` 的一系列过程总结如下：

:::tip

下面称 `leavingRecords` 匹配的所有组件为**离开组件**，`enteringRecords` 匹配的所有组件为**目标组件**，`enteringRecords` 匹配的所有组件为**复用组件**

另外，你也可以查看[官方文档](https://next.router.vuejs.org/guide/advanced/navigation-guards.html#the-full-navigation-resolution-flow)
对于这部分流程的原文。
:::

- 调用离开组件的 `beforeRouteLeave` 守卫。
- 调用全局的 `beforeEach` 守卫
- 调用复用组件内部的 `beforeRouteUpdate` 守卫
- 调用目标路由配置的 `beforeEnter` 守卫
- 处理异步组件
- 调用目标组件内部的 `beforeRouteEnter` 守卫
- 初始化并调用全局的 `beforeResolve` 守卫
- 如果上述操作有异常，会在最后的 `catch()` 回调中被捕获到

如何保证守卫都按顺序执行？来看 `runGuardQueue`，它通过 `Array.prototype.reduce` 保证了 `guards` 链式执行：

原理是把后一个 `guard` 放到前一个 `guard` 的 `then` 回调中：

```typescript
function runGuardQueue(guards: Lazy<any>[]): Promise<void> {
  return guards.reduce(
    (promise, guard) => promise.then(() => guard()),
    Promise.resolve()
  )
}
```

如果没有理解，可以运行下面的代码感受一下：

```typescript
// 链式的 Promise

const promises = new Array(10).fill(null).map((item, index) => {
  return () => {
    return Promise.resolve("promise " + index + " resolved!");
  }
});

const reducer = (promise, guard) => {
  return promise.then((res) => {
    console.log(res);
    return guard(res);
  });
}

promises.reduce(reducer, Promise.resolve());
```

运行结果：

<a data-fancybox title="" href="http://cdn.yuzzl.top/blog/20201217185242.png">![](http://cdn.yuzzl.top/blog/20201217185242.png)</a>

#### finalizeNavigation -- 完成导航

这个方法主要做三件事情：

- 调用之前封装好的**historyAPI**执行跳转（**url层面的跳转**）
- 修改当前路由 `currentRoute`，前面说过，它是**响应式**的，视图层的更新将在之后自动被触发
- 调用 `markAsReady()` 来进行一些初始化工作（这个工作只会执行**一次**）。

```typescript
function finalizeNavigation(
  toLocation: RouteLocationNormalizedLoaded,
  from: RouteLocationNormalizedLoaded,
  isPush: boolean,
  replace?: boolean,
  data?: HistoryState,
): NavigationFailure | void {
  const error = checkCanceledNavigation(toLocation, from)
  if (error) return error

  // 是否为首次导航
  const isFirstNavigation = from === START_LOCATION_NORMALIZED
  const state = !isBrowser ? {} : history.state
  if (isPush) {
    // 调用routerHistoryAPI，执行 url 层面上的跳转
    if (replace || isFirstNavigation)
      // replace模式
      routerHistory.replace(
        toLocation.fullPath,
        assign(
          {
            scroll: isFirstNavigation && state && state.scroll,
          },
          data,
        ),
      )
    // push模式
    else routerHistory.push(toLocation.fullPath, data)
  }

  // 修改当前响应式路由 currentRoute，视图层的更新将会被触发
  currentRoute.value = toLocation

  // 判断全局router是否初始化完成，下面会说
  markAsReady()
}
```

来看看`markAsReady()`:

```typescript
function markAsReady(err?: any): void {
  if (ready) return
  ready = true
  setupListeners()
  readyHandlers
    .list()
    .forEach(([resolve, reject]) => (err ? reject(err) : resolve()))
  readyHandlers.reset()
}
```

全局的 `router` 内部有一个 `ready` 变量，在路由首次初始化成功时会执行 `if (ready)` 之后的内容，主要做了如下事情：

- `setupListeners()` 初始化监听器，我们开篇说过，用户在浏览器上点击后退按钮时，会触发 `popstate` 事件。触发时执行的套路和 `pushWithRedirect` 十分相似 --- 调用 `navigate`
  同时在 `navigate` 成功完成时通过修改响应式变量让视图层更新。
- 初始化 `readyHandlers`，它其实也是通过 `useCallbacks()` 初始化的类似路由守卫的东西。

#### triggerAfterEach -- 处理后置守卫

它的代码很简单，功能就是获取所有注册的**后置守卫**，依次执行它们：

```typescript
 function triggerAfterEach(
  to: RouteLocationNormalizedLoaded,
  from: RouteLocationNormalizedLoaded,
  failure?: NavigationFailure | void,
): void {
  // 获取所有注册的后置守卫，依次执行它们
  for (const guard of afterGuards.list()) guard(to, from, failure)
}
```

### router-view 和 router-link

下面来探究 vue-router 的两个基本组件：`router-view` 和 `router-link`。

#### router-view

router-view 将显示与当前 url 相匹配的组件。也就是说，不同的路由将被渲染在这里：

```html
<!-- 当前路由对应的组件将被渲染在这里 -->
<div id="app">
  <router-view></router-view>
</div>
```

来看看它的源码，主要关注 `setup` 部分：

首先，通过 `inject` API 拿到当前路由 `injectedRoute`，这个是由全局 `app` 通过执行 `provide` 得到的（上面已经提及）：

```typescript
// 拿到当前路由
const injectedRoute = inject(routerViewLocationKey)!;
```

也可以结合下图感受一下：

<a data-fancybox title="" href="http://cdn.yuzzl.top/blog/20201216132538.png">![](http://cdn.yuzzl.top/blog/20201216132538.png)</a>

之后，routerToDisplay 决定了要渲染的路由，如果 `props.route` 有值，则渲染它，否则渲染我们上面提到的 `injectedRoute`：

```typescript
const routeToDisplay = computed(() => props.route || injectedRoute.value);
```

注意这里的 `routeToDisplay = computed()` 可以获得一个不可变的响应式对象，也就是说，一旦 `injectedRoute.value` 或者 `props.route` 更新，`routeToDisplay`
的 `value` 也会变化。

接下来，我们从 `routeToDisplay` 拿到匹配到的路由：

```typescript
const matchedRouteRef = computed<RouteLocationMatched | undefined>(
  () => routeToDisplay.value.matched[depth]
);
```

下面解释一下这个 `depth` ，我们知道，一个 `match` 里面可能有多个匹配到的路由，例如这样的路由结构：

```vue
<!-- 细节内容省略 -->
<template>
  <div>
    <p>Nested level {{ level }}</p>
    <ul v-if="level === 1 && $route.name === 'Nested'">
      <!-- content....-->
    </ul>
    <router-view v-if="level < 6"></router-view>
  </div>
</template>
```

也就是说，顶层 `router-view` 渲染 `/children` 下的内容，第二层渲染 `/children/b` 下的内容，第三层渲染 `/children/b` 下的内容（注意和第二层的区别，这个是第二层孩子的默认值，在路由
url 层面下体现为 `/children/b` 加上空字符串）。

调试看看匹配的路由：

<a data-fancybox title="" href="http://cdn.yuzzl.top/blog/20201216161630.png">![](http://cdn.yuzzl.top/blog/20201216161630.png)</a>

这样通过判断当前深度就可以正确匹配路由了，这也顺便解释了上面 `depth` 的意义。

回到主线，在获取匹配到的路由之后，我们将一些必要的信息通过 `provide` 交给未来的孩子组件：

```typescript
// 孩子得到的深度就是当前的深度加一，结合上面的内容不难理解
provide(viewDepthKey, depth + 1);
// 匹配到的路由
provide(matchedRouteKey, matchedRouteRef);
// 当前路径
provide(routerViewLocationKey, routeToDisplay);
```

最后返回一个渲染函数，结合注释来感受下过程，省略一些边界条件的代码，只保留主干部分：

```typescript
return () => {
  // 当前路由 URL
  const route = routeToDisplay.value;
  // 匹配到的路由
  const matchedRoute = matchedRouteRef.value;
  // 匹配到的组件，将被渲染
  const ViewComponent = matchedRoute && matchedRoute.components[props.name];
  // 当前组件名称
  const currentName = props.name;

  // 获取匹配到的路由的一些配置（routeProps）
  const routePropsOption = matchedRoute!.props[props.name];
  const routeProps = routePropsOption
    ? routePropsOption === true
      ? route.params
      : typeof routePropsOption === "function"
        ? routePropsOption(route)
        : routePropsOption
    : null;

  // 调用 vue 的 h API，这个 API 的功能是生成 v-node，第一个参数为 vue组件，第二个参数为 props
  const component = h(
    ViewComponent,
    assign({}, routeProps, attrs, {
      onVnodeUnmounted,
      ref: viewRef
    })
  );

  // 返回 被渲染的组件的 v-node
  return (
    // ....
    component
  );
};
```

#### router-link

我们使用自定义组件 `router-link` 而不是使用常规标签 `<a>` 来创建链接。

这样我们可以更改URL而无需重新加载页面。

```typescript
export const RouterLinkImpl = defineComponent({
  // 省略 props
  setup(props, {slots, attrs}) {
    const link = reactive(useLink(props));
    const {options} = inject(routerKey)!;

    // 处理元素的类名
    const elClass = computed(() => ({
      [getLinkClass(
        props.activeClass,
        options.linkActiveClass,
        "router-link-active"
      )]: link.isActive,
      [getLinkClass(
        props.exactActiveClass,
        options.linkExactActiveClass,
        "router-link-exact-active"
      )]: link.isExactActive
    }));


    // 返回生成 v-dom 的函数
    return () => {
      // 拿到 slot 中的内容
      const children = slots.default && slots.default(link);
      // 在 非 custom 模式下，我们会在其外围包裹一个 a 标签，这些也通过 h API 来实现
      return props.custom
        ? children
        : h(
          "a",
          assign(
            {
              "aria-current": link.isExactActive
                ? props.ariaCurrentValue
                : null,
              onClick: link.navigate,
              href: link.href
            },
            attrs,
            {
              class: elClass.value
            }
          ),
          children
        );
    };
  }
});
```

`router-link` 通过一个**作用域插槽**暴露底层的定制能力：

```vue
<!-- 案例来自 vue-router 官网-->
<router-link
    to="/about"
    v-slot="{ href, route, navigate, isActive, isExactActive }">
<NavLink :active="isActive" :href="href" @click="navigate">{{ route.fullPath }}
</NavLink>
</router-link>
```

这五个 API 通过 `useLink()` 来实现，来看源码：

route 是目标路由，也就是我们点击 `router-link` 导向的位置，它通过拿到用户传入的 `to` 属性，解析成 `url`：

```typescript
const route = computed(() => router.resolve(unref(props.to)));
```

href 是解析后的 url，相当于 a 元素的 href 属性，从源码中看出它来自 `route.value.href`：

```typescript
href: computed(() => route.value.href);
```

`isActive` 表示当前 `router-link` 是否处于 “激活状态”，来看下面的代码：

`activeRecordIndex` 记录了匹配当前路由、且处于活跃状态组件的下标。 有了活跃项目下标还不够，我们还要通过 `includesParams()` 来处理动态路由，可以看出是通过**逐一比较 `params` 来实现**的：

```typescript
const isActive = computed<boolean>(
  () =>
    activeRecordIndex.value > -1 &&
    includesParams(currentRoute.params, route.value.params)
);

function includesParams(
  outer: RouteLocation["params"],
  inner: RouteLocation["params"]
): boolean {
  // 遍历 keys
  for (let key in inner) {
    let innerValue = inner[key];
    let outerValue = outer[key];
    if (typeof innerValue === "string") {
      if (innerValue !== outerValue) return false;
    } else {
      // 对数组处理利用了 `Array.prototype.some()`
      // some() 方法测试数组中是不是至少有 1 个元素通过了被提供的函数测试。
      // 它返回的是一个 Boolean 类型的值。
      if (
        !Array.isArray(outerValue) ||
        outerValue.length !== innerValue.length ||
        innerValue.some((value, i) => value !== outerValue[i])
      )
        return false;
    }
  }
  return true;
}
```

可以看出这里的激活状态是一个**浅层**的活跃状态，例如，子组件对应的 `router-link` 如果是激活状态，那么其父路径对应的 `router-link` 也处于激活状态。

`isExactActive` 则是一个严格比较，他要求当前路由和这个组件**完全匹配**，也就是说，当前路由必须和匹配路由的**最后一个**相同，即所有的父级路由全被排除在外：

```typescript
const isExactActive = computed<boolean>(
  () =>
    activeRecordIndex.value > -1 &&
    activeRecordIndex.value === currentRoute.matched.length - 1 &&
    isSameRouteLocationParams(currentRoute.params, route.value.params)
);
```

另外，上面对 `params` 的对比是一个 **浅层的对比**，而在这里则是一个深层的比较（使用递归的方式）：

```typescript

export function isSameRouteLocationParams(
  a: RouteLocationNormalized["params"],
  b: RouteLocationNormalized["params"]
): boolean {
  if (Object.keys(a).length !== Object.keys(b).length) return false;

  for (let key in a) {
    if (!isSameRouteLocationParamsValue(a[key], b[key])) return false;
  }

  return true;
}
```

最后一个 `navigate`，是一个执行路由跳转的方法，本质上是调用了上面说到的 `router.replace` 或者 `router.push`：

```typescript
function navigate(
  e: MouseEvent = {} as MouseEvent
): Promise<void | NavigationFailure> {
  if (guardEvent(e))
    return router[unref(props.replace) ? "replace" : "push"](unref(props.to));
  return Promise.resolve();
}
```

## PART 2 总结

在第二部分的内容中，我们详细阐述了在第一部分封装完成的路由核心是如何结合 `vue` 来实现目标功能的。

路由的初始化从 `createRouter()` 开始，正确的路径可以成功匹配（match）到相应的路由，从而匹配到路由组件。匹配的内部实现基于全局 matcher
维护的匹配器，通过传入当前路径，遍历匹配器，寻找到符合的匹配器对应的一个或多个组件。

`router-view` 组件是路由渲染的核心，它可以拿到当前路由，然后利用上面的 matcher
匹配到组件并渲染它。另外，它还支持路由的嵌套，此功能能够正确运行的基础在于匹配到的路由深度随着下标的增大而增大，我们可以根据深度找到对应关系。

`router-link` 用来替代 `<a>` 标签，赋予了路由跳转的功能。另外，它还利用 `vue` 的作用域插槽暴露一些底层的 API 供库作者或者开发者使用，一个典型的案例就是 CMS 后台的路由侧边栏。

在路由切换的过程中有大量的守卫钩子，这些钩子会在适当的地方执行，不同的类型钩子之间通过 `promise` 链式调用。同时其内部也考虑了异步路由（懒加载）的方式。

另外还有一些细节功能，例如路由别名、滚动处理等，如果有兴趣可以自行查看源码探究。

## 参考资料

| 标题                                      | 来源                                                   |
| ----------------------------------------- | ------------------------------------------------------ |
| vue-router-next 仓库                        | https://github.com/vuejs/vue-router-next             |
| vue-router-next 文档                       |    https://next.router.vuejs.org              |
| vue-next 文档                       |   https://v3.vuejs.org/           |
| MDN                              |  https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Array/some      |


