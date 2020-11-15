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
`VueRouter`的`hashRouter`是基于`WebHistory`的，只是在基础url之后加了一个`#`，这一操作不仅实现了`hashRouter`的特性，同时完美利用了之前封装好的`HistoryAPI`。


## 路由vuetify
在这里，之前封装好的一套路由API将被赋予`vue`的特性, 这也是`VueRouter`源码的核心部分。主要的代码位于`src/router.ts`下，下面展示一个DEMO代码（来自官网），来回顾一下`VueRouter`是如何使用的：

```javascript
//第一步：定义路由组件
const Home = { template: '<div>Home</div>' }
const About = { template: '<div>About</div>' }

//第二步：定义路由表
const routes = [
  { path: '/', component: Home },
  { path: '/about', component: About },
]

//第三步：初始化路由
const router = VueRouter.createRouter({
	第四步：设置路由的模式
  history: VueRouter.createWebHashHistory(),
  routes: routes
})

//第五步：初始化vue
const app = Vue.createApp({})

app.use(router)

app.mount('#app')

// 现在，一切准备就绪！
```

我们介绍的重点在第三步，我们从`createRouter()`起手来分析其原理。

### createRouter -- 路由的初始化

#### 总述

`createRouter()`用来创建供Vue应用程序使用的Router实例。它返回一个`router`对象，里面就是我们熟悉的一系列`vue-router`API：

![](http://cdn.yuzzl.top/blog/20201114190252.png)

#### 整体过程

去除函数定义，`createRouter`的过程如下所示，为了简洁，省略了函数的定义（后面都会提到），以及一些细节代码，突出主干。

请看下面代码，我以注释的形式描述整体过程：

```typescript
export function createRouter(options: RouterOptions): Router {
  // 1.初始化路由matcher，可以把它看成“路由管理器”
  const matcher = createRouterMatcher(options.routes, options)
  
  // 2.获取路由API（hashAPI或者HistoryAPI）
  let routerHistory = options.history
	
  // 3.利用useCallbacks()初始化路由前置守卫/解析守卫/后置守卫
  const beforeGuards = useCallbacks<NavigationGuardWithThis<undefined>>()
  const beforeResolveGuards = useCallbacks<NavigationGuardWithThis<undefined>>()
  const afterGuards = useCallbacks<NavigationHookAfter>()
  
 	// 4.当前路由，注意这里和vue3.0结合了，使用了shallowRef这个API，做到了路由监听
  const currentRoute = shallowRef<RouteLocationNormalizedLoaded>(
    START_LOCATION_NORMALIZED,
  )
 
  const router: Router = {
    // 5. 准备挂载到全局vueApp上，这是vuejs提供的插件功能，之后这个函数会被vue调用
    install(app: App) {
      // 省略，后面会提到
    },
    // 省略其他暴露的API，可见上图
  }
  return router
}
```



#### createRouterMatcher -- 初始化路由matcher

```typescript
const matcher = createRouterMatcher(options.routes, options)
```

首先利用`createRouterMatcher()`初始化了`matcher`变量，这个函数返回值如下, 可以看出是路由处理的一套API，其中有部分再次向外暴露给用户（可以对比一下本节的第一张图片），如`addRoute`，很明显，我们可以利用这些API使用**动态路由**功能：

```typescript
return { addRoute, resolve, removeRoute, getRoutes, getRecordMatcher }
```

##### addRoute()

`createRouterMatcher`传入路由表`routes`，以及全局配置`globalOptions`, 它利用`addRoute()`递归地遍历路由表, 来看`addRoute()`，其中参数`record`表示单个路由记录:

```typescript
function addRoute(
 record: RouteRecordRaw,
 parent?: RouteRecordMatcher,
 originalRecord?: RouteRecordMatcher,
) {
  // 判断是否为根路由
  let isRootAdd = !originalRecord
  
  // 传入record，初始化单个路由选项的数据结构，传给 mainNormalizedRecord
  let mainNormalizedRecord = normalizeRouteRecord(record)
  
  // 处理路由别名功能
  mainNormalizedRecord.aliasOf = originalRecord && originalRecord.record
  const options: PathParserOptions = mergeOptions(globalOptions, record)
  
  const normalizedRecords: typeof mainNormalizedRecord[] = [
    mainNormalizedRecord,
  ]
  
  if ('alias' in record) {
    const aliases =
          typeof record.alias === 'string' ? [record.alias] : record.alias!
          for (const alias of aliases) {
            normalizedRecords.push(
              assign({}, mainNormalizedRecord, {
                components: originalRecord
                ? originalRecord.record.components
                : mainNormalizedRecord.components,
                path: alias,
                aliasOf: originalRecord
                ? originalRecord.record
                : mainNormalizedRecord,
              }) as typeof mainNormalizedRecord,
            )
          }
  }

  let matcher: RouteRecordMatcher
  let originalMatcher: RouteRecordMatcher | undefined
	
  // 遍历所有路由记录
  for (const normalizedRecord of normalizedRecords) {
    // 格式化路径
    let { path } = normalizedRecord
    if (parent && path[0] !== '/') {
      let parentPath = parent.record.path
      let connectingSlash =
          parentPath[parentPath.length - 1] === '/' ? '' : '/'
      normalizedRecord.path =
        parent.record.path + (path && connectingSlash + path)
    }

    // 初始化父路由信息（为子路由准备的）
    matcher = createRouteRecordMatcher(normalizedRecord, parent, options)

    // if we are an alias we must tell the original record that we exist
    // so we can be removed
    if (originalRecord) {
      originalRecord.alias.push(matcher)
    } else {
      // otherwise, the first record is the original and others are aliases
      originalMatcher = originalMatcher || matcher
      if (originalMatcher !== matcher) originalMatcher.alias.push(matcher)

      // remove the route if named and only for the top record (avoid in nested calls)
      // this works because the original record is the first one
      if (isRootAdd && record.name && !isAliasRecord(matcher))
        removeRoute(record.name)
    }
		
    // 判断是否有孩子，如果有，递归执行addRoute()，以matcher（代表父路由）、originalRecord（代表未经处理过的路由原始记录）
    if ('children' in mainNormalizedRecord) {
      let children = mainNormalizedRecord.children
      for (let i = 0; i < children.length; i++) {
        addRoute(
          children[i],
          matcher,
          originalRecord && originalRecord.children[i],
        )
      }
    }

    // if there was no original record, then the first one was not an alias and all
    // other alias (if any) need to reference this record when adding children
    originalRecord = originalRecord || matcher

    insertMatcher(matcher)
  }

  return originalMatcher
    ? () => {
    // since other matchers are aliases, they should be removed by the original matcher
    removeRoute(originalMatcher!)
  }
  : noop
}
```

#### 初始化路由守卫

##### useCallbacks()

三种路由守卫都通过` useCallbacks<T>()`来初始化，可以看出这是一个闭包，`handlers: T[]`是存储用户注册的守卫函数的地方:

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

这个函数被调用之后返回一个对象，并且，`add`会在`createRouter`作为我们熟悉的`beforeEach`等API暴露给调用者：

![image-20201115122627609](C:\Users\yuzhanglong\AppData\Roaming\Typora\typora-user-images\image-20201115122627609.png)

`add`用来注册守卫，`reset` 清空守卫，`list`是一个函数，返回`handlers`数组，在相应的时机`vue-router`会遍历调用之。

#### 当前路由 -- currentRoute

这是响应式路由的核心，`START_LOCATION_NORMALIZED`为默认路由（`/`）：

```javascript
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

const currentRoute = shallowRef<RouteLocationNormalizedLoaded>(
  START_LOCATION_NORMALIZED,
)
```

使用vue的**响应式API**`shallowRef`处理`currentRoute`使其成为响应式的，一旦它改变就会触发视图的更新。

可参考：https://www.vue3js.cn/docs/zh/api/refs-api.html#shallowref



#### install -- 向vue添加全局功能

##### vue插件机制概述

`vue3.0`文档如此介绍插件机制：

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
const installedApps = new Set<App>()

install(app: App) {
  // 获取路由对象
  const router = this
  
  // 通过全局混入来添加一些组件选项，如我们熟悉的RouterLink、RouterView
  app.component('RouterLink', RouterLink)
  app.component('RouterView', RouterView)

  // 添加全局实例方法：router，使用者可以通过$router来获取vuerouter对象
  app.config.globalProperties.$router = router

  // 劫持上面的全局实例方法，
  // 通过unref之后的currentRoute是普通的对象而不是响应式对象
  // 便于调用者二次处理
  Object.defineProperty(app.config.globalProperties, '$route', {
    get: () => unref(currentRoute),
  })
  
  // 创建初始导航，上面说过，默认的当前路由为 “/”，但是如果用户输入了 “/hello”，便不是 “/"了，所以我们要初始化一次"
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
  
  // provide可向根组件中注入一个 property，值得注意的是这里的 routerKey、routeLocationKey都是Symbol类型，有效防止了成员变量的命名冲突
  app.provide(routerKey, router)
  app.provide(routeLocationKey, reactive(reactiveRoute))

  // 覆写全局组件的unmount方法（先使用unmountApp指向app.unmount），然后重写app.unmount，之后执行app的unmountApp
  let unmountApp = app.unmount
  
  // 这应该是考虑一个页面多个vue全局实例的情况，installedApps是一个set，每一个app创建时就会向集合中添加它（的引用）
  installedApps.add(app)
  app.unmount = function() {
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
	// 针对vue-devtools的处理，略去
}
```

### 路由跳转

#### 总述

路由跳转接口有这些：

- push
- replace
- pop
- back
- forward

其中`back` , `forward`其实就是`go(+1 / -1)`，`push`和`replace`请看下面代码：

```typescript
function push(to: RouteLocationRaw | RouteLocation) {
	return pushWithRedirect(to)
}

function replace(to: RouteLocationRaw | RouteLocationNormalized) {
  return push(assign(locationAsObject(to), { replace: true }))
}
```

可以看出他们本质上都是调用了`pushWithRedirect`，下面我们来看看`pushWithRedirect`。

#### pushWithRedirect -- 路由跳转的核心

下面结合代码注释描述一下`pushWithRedirect`的过程，具体细节的方法会单独提及。

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
    if (shouldRedirect)
      return pushWithRedirect(
        assign(shouldRedirect, { state: data, force, replace }),
        redirectedFrom || targetLocation,
      )
		
    const toLocation = targetLocation as RouteLocationNormalized

    // 如果是来自重定向的，记录重定向来源 -- 既然执行到了这里就是最终的路由
    toLocation.redirectedFrom = redirectedFrom
      
    // 错误对象，下面的可能发生的错误都会赋值给他，最后它会被统一处理
    let failure: NavigationFailure | void | undefined

    // 如果不是强制跳转，但是是相同的路由，
    // 我们就会产生一个错误并交给failure变量，到后面统一处理
    if (!force && isSameRouteLocation(stringifyQuery, from, targetLocation)) {
      failure = createRouterError<NavigationFailure>(
        ErrorTypes.NAVIGATION_DUPLICATED,
        { to: toLocation, from },
      )

      // trigger scroll to allow scrolling to the same anchor
      handleScroll(
        from,
        from,
        // this is a push, the only way for it to be triggered from a
        // history.listen is with a redirect, which makes it become a push
        true,
        // This cannot be the first navigation because the initial location
        // cannot be manually navigated to
        false,
      )
    }

    // 最终我们返回一个promise，
    // 1.首先判断之前的操作是否出现错误，
    // 1.1 如果一切正常，我们调用navigate，传入相应的路由参数执行跳转，如果执行跳转失败，则走到下面的catch，成功则走到下面的then
    // 1.2 如果出现了错误，那么我们resolve一个promise，走到了下面的then
    return (failure ? Promise.resolve(failure) : navigate(toLocation, from))
      .catch((error: NavigationFailure | NavigationRedirectError) =>
        isNavigationFailure(error)
          ? error
          : // 处理未知错误
          triggerError(error),
      )
      // 上面的navigate执行跳转成功，以及failure有值都会走到这里，我们只要根据failure的值进行对应的处理即可
      .then((failure: NavigationFailure | NavigationRedirectError | void) => {
        if (failure) {
          // 一系列错误判断和警告，略去不表
          
          // 最后我们调用pushWithRedirect执行跳转失败的重定向，重定向的配置和错误的类型有关
          return pushWithRedirect(
            // keep options
            assign(locationAsObject(failure.to), {
              state: data,
              force,
              replace,
            }),
            // preserve the original redirectedFrom if any
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
        // 路由跳转结束的操作，在这里afterEach守卫将被处理
        triggerAfterEach(
          toLocation as RouteLocationNormalizedLoaded,
          from,
          failure,
        )
        return failure
      })
  }
```

#### navigate

如果`pushWithRedirect`的主要过程没有出现错误，也就是说`failure`为`undefined`，那么就会执行`navigate`。





#### finalizeNavigation -- 导航完成

这个方法主要做四件事情：

- 调用之前封装好的**historyAPI**执行跳转（**url层面的跳转**）
- 修改当前路由`currentRoute`，前面说过，它是**响应式**的（**视图层面的跳转**）
- 触发`handleScroll`
- 调用`markAsReady()`来进行一些初始化工作（这个工作只会执行**一次**）。

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
    // 调用routerHistoryAPI，执行url层面上的跳转
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

  // 修改当前响应式路由currentRoute
  currentRoute.value = toLocation
    
  handleScroll(toLocation, from, isPush, isFirstNavigation)
	
  // 判断全局router是否初始化完成
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

全局的`router`内部有一个`ready`变量，在路由首次初始化成功时会执行`if (ready)`之后的内容 ，主要做了如下事情：

- `setupListeners()`初始化监听器，我们开篇说过，用户在浏览器上点击后退按钮时，会触发`popstate`事件。触发时执行的套路和`pushWithRedirect`十分相似 --- 调用`navigate`同时在`navigate`成功完成时通过修改响应式变量让视图层更新。
- 初始化`readyHandlers`，它其实也是通过`useCallbacks()`初始化的类似路由守卫的东西。

#### triggerAfterEach -- 处理后置守卫

它的代码很简单， 功能就是获取所有注册的**后置守卫**，依次执行它们：

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

### 路由组件

