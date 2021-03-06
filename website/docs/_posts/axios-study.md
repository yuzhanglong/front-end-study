---
date: 2020-10-23

tags:

- 源码解读
- JavaScript
---

# Axios 源码解析

[[toc]]

## 总述

`Axios` 是一个 NB 的**网络请求库**(前后端神器)，基于 `Promise` 封装了 HTTP 请求，用于**浏览器**和**node.js**，GitHub **77000+**
Star（截至 2020 年 10 月 18 日）。也是前端必备的一个第三方库。


Axios 的代码**不算复杂**，反而**清晰易懂**、十分优雅（个人觉得特别是请求/响应拦截器的处理和 cancelToken 的处理），另外它涉及了很多 JavaScript 的基础知识，非常适合用来巩固基础。

本文在讲源码的同时也会穿插一些涉及前端的知识。

本文使用的 axios 版本: **v0.20.0**。

## 项目结构

axios 的项目结构如下，省略了和本文无关的目录或文件和细节目录。它的源代码在 `lib` 下：

```plain
axios                                                             
├─ lib                                                             // 项目源码目录
│  ├─ adapters                                                     // 请求适配器
│  │  ├─ http.js                                                   // http适配器
│  │  └─ xhr.js                                                    // xhr适配器
│  ├─ axios.js                                                     // axios的实例
│  ├─ cancel                                                       // 请求取消模块
│  ├─ core                                                         // 核心模块
│  │  ├─ Axios.js                                                  // Axios对象
│  │  ├─ buildFullPath.js                                          // url构建
│  │  ├─ createError.js                                            // 自定义异常相关
│  │  ├─ dispatchRequest.js                                        // 请求封装
│  │  ├─ enhanceError.js                                           // 自定义异常相关
│  │  ├─ InterceptorManager.js                                     // 拦截器类
│  │  ├─ mergeConfig.js                                            // 配置合并工具
│  │  ├─ settle.js                                                 // promise处理工具
│  │  └─ transformData.js                                          // 数据转换工具
│  ├─ defaults.js                                                  // 默认配置
│  ├─ helpers                                                      // 各种工具函数         │  └─ utils.js
```

## 基本流程

Axios 的**一次基本流程**如下：

- 初始化 axios 实例（包括配置处理、拦截器等）
- 执行请求拦截器
- 根据当前环境选择合适的网络适配器(adapter)（xhr -- 浏览器， http request -- node.js），并执行之（发送请求）
- 处理响应数据
- 执行响应拦截器
- 请求完成，调用者可获取响应数据

## 实例 (instance) 的导入

执行下面的代码，我们创建了一个 **axios 实例**，我们接下来按照代码顺序来阐述整个执行过程。

```javascript
const axios = require('../../lib/axios');
```

模块的代码如下:

```javascript
// 创建一个Axios实例
function createInstance(defaultConfig) {
  var context = new Axios(defaultConfig);
  var instance = bind(Axios.prototype.request, context);
  // 将axios.prototype复制到实例（继承）
  utils.extend(instance, Axios.prototype, context);
  // 将上下文复制到实例（继承）
  utils.extend(instance, context);
  return instance;
}

// 创建要导出的默认实例
var axios = createInstance(defaults);

// 公开Axios类以允许类继承
axios.Axios = Axios;

// 用于创建新实例的工厂
axios.create = function create(instanceConfig) {
  return createInstance(mergeConfig(axios.defaults, instanceConfig));
};

// Expose Cancel & CancelToken
axios.Cancel = require('./cancel/Cancel');
axios.CancelToken = require('./cancel/CancelToken');
axios.isCancel = require('./cancel/isCancel');

// Expose all/spread
axios.all = function all(promises) {
  return Promise.all(promises);
};

axios.spread = require('./helpers/spread');

module.exports = axios;

// Allow use of default import syntax in TypeScript
module.exports.default = axios;
```

### createInstance() - 创建实例

```javascript
function createInstance(defaultConfig) {
  var context = new Axios(defaultConfig);
  var instance = bind(Axios.prototype.request, context);
  // 将axios.prototype复制到实例（继承）
  utils.extend(instance, Axios.prototype, context);
  // 将上下文复制到实例（继承）
  utils.extend(instance, context);
  return instance;
}
```

见名知义，`createInstance` 便是创建实例的核心函数了，它返回了 `instance` 这个变量，内部通过 `extend`、`bind` 这两个工具来进行加工。

### instance 的扩展

第二行：`var instance = bind(Axios.prototype.request, context);`, 这里的`bind`函数如下:

```javascript
'use strict';

module.exports = function bind(fn, thisArg) {
  return function wrap() {
    var args = new Array(arguments.length);
    for (var i = 0; i < args.length; i++) {
      args[i] = arguments[i];
    }
    return fn.apply(thisArg, args);
  };
};
```

`bind()`最终返回一个`function`，这个`function`的作用：以`thisArg`为函数调用上下文(this)，调用`fn`。

最终，`instance`变成了一个函数，即`Axios.prototype.request`，函数调用上下文(this)为`context`, 也就是`new Axios(defaultConfig)`,
它来自在前一行新建的一个 axios 对象。

:::tip 关于 apply()

给函数传参，并拥有控制函数调用上下文即函数体内 this 值的能力 ，在上面的例子中，函数的 this 为 thisArg，参数为 args（一个数组），它通过一个简单的循环遍历得到。

类似的，ECMAScript 中的函数还有一个方法：**call()**，只不过`call()`的参数需要一个一个列出来。
:::

:::tip 关于 arguments

函数内部存在的一个特殊对象，它是一个**类数组对象**，包含调用函数时传入的所有参数。这个对象只有以 function 关键字定义函数（相对于使用箭头语法创建函数）时才会有。

在上面代码出现的`arguments`是`wrap()`函数的参数。
:::

值得注意的是，虽然在 ECMAScript5 中已经内置了这个方法：`Function.prototype.bind()`, 但由于兼容性问题（**iE9+**），不直接使用。

#### utils.extend() - 实例的复制

`utils.extend()` 也是一个工具函数，内容如下:

```javascript
/**
 * 通过可变地添加对象b的属性来扩展对象a。
 *
 * @param {Object} a 要扩展的对象
 * @param {Object} b 要复制属性的对象
 * @param {Object} thisArg 要绑定功能的对象
 * @return {Object} 对象a的结果值
 */
function extend(a, b, thisArg) {
  forEach(b, function assignValue(val, key) {
    if (thisArg && typeof val === 'function') {
      a[key] = bind(val, thisArg);
    } else {
      a[key] = val;
    }
  });
  return a;
}
```

里面又出现了一个 `foreach()`，内容如下:

```javascript
function forEach(obj, fn) {
  // Don't bother if no value provided
  if (obj === null || typeof obj === 'undefined') {
    return;
  }

  // Force an array if not already something iterable
  if (typeof obj !== 'object') {
    /*eslint no-param-reassign:0*/
    obj = [obj];
  }

  if (isArray(obj)) {
    // Iterate over array values
    for (var i = 0, l = obj.length; i < l; i++) {
      fn.call(null, obj[i], i, obj);
    }
  } else {
    // Iterate over object keys
    for (var key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        fn.call(null, obj[key], key, obj);
      }
    }
  }
}
```

我们自上而下解读:

- 特殊情况的判断，`obj` 为空，或者 `obj` 为 `undefined`，我们不处理，直接 `return`

```javascript
if (obj === null || typeof obj === 'undefined') {
  return;
}
```

- 对于**不可迭代的对象**，我们**强制转换**成一个`array`。

```javascript
if (typeof obj !== 'object') {
  obj = [obj];
}
```

- 对于可迭代的**数组**，我们执行 `fn`

```plain
for (var i = 0, l = obj.length; i < l; i++) {
   fn.call(null, obj[i], i, obj);
}
```

- 对于可迭代的**对象**，也是差不多的思路。

```javascript
for (var key in obj) {
  if (Object.prototype.hasOwnProperty.call(obj, key)) {
    fn.call(null, obj[key], key, obj);
  }
}
```

综上所述，`foreach` 遍历一个（可迭代的）数组或一个对象，为每个项**执行传入的函数**。

回到我们的 `extend()`，看看我们传入的函数 `assignValue`，这个函数的作用便是在**迭代 b 的过程**中**为 a 赋值**。

```javascript
function extend(a, b, thisArg) {
  forEach(b, function assignValue(val, key) {
    // 对于函数，利用了上面说到的bind()
    if (thisArg && typeof val === 'function') {
      a[key] = bind(val, thisArg);
    } else {
      a[key] = val;
    }
  });
  return a;
}
```

所以最终我们的 `instance` 被如何扩展？很明显：

- 第一个 `extend` 扩展了 `Axios.prototype`, 即 Axios 对象的原型。
- 第二个 `extend` 扩展了 `context`, 即 **Axios 对象**，这个对象含有用户传入的一系列配置信息（这个对象的详细内容会在下面详细说明）。

这里有一个小问题，为什么我们在生成实例的时候不直接生成 `Axios` 对象，而是先以`Axios.prototype.request`为基础，然后基于上面说到的两部分进行扩展呢？个人认为是**方便调用者调用，不用额外再手动新建对象**。

### 其他扩展

在 axios 实例被 `export` 前，它被添加了几个静态方法。

#### axios.create -- 创建新实例的工厂

`axios.create` 给用户提供了自定义配置的接口，通过调用 `mergeConfig()` 来合并用户配置和默认配置。从而我们可以得到一个自定义的 `instance`：

```javascript
axios.create = function create(instanceConfig) {
  return createInstance(mergeConfig(axios.defaults, instanceConfig));
};
```

#### axios.all -- 同时执行多个请求

如果你了解过 `Promise.all()`, 那么你一定可以猜出 `axios.all` 是个啥了。

```javascript
axios.all = function all(promises) {
  return Promise.all(promises);
};
```

#### axios.spread -- 用于调用函数并扩展参数数组的语法糖

`axios.spread` 常和 `axios.all` 配合使用，例如：

```javascript
function getUserAccount() {
  return axios.get('/user/12345');
}

function getUserPermissions() {
  return axios.get('/user/12345/permissions');
}

axios.all([getUserAccount(), getUserPermissions()])
  .then(axios.spread(function (acct, perms) {
    // 两个请求现在都执行完成
  }));
```

我们来看看 `axios.spread()` 的实现:

```javascript
'use strict';
module.exports = function spread(callback) {
  return function wrap(arr) {
    return callback.apply(null, arr);
  };
};
```

`axios.spread()` 要求我们传入一个函数，最终 `promise.all()` 的结果会作为它的参数，并通过 `callback.apply()` 执行。

#### axios.Cancel -- 支持主动取消请求

这个功能非常有意思，用户可以调用这个接口来随时**取消请求**，像这样：

```javascript
const CancelToken = axios.CancelToken;
const source = CancelToken.source();

axios.get('xxxxxxxxx', {
  cancelToken: source.token
}).catch(function (thrown) {
  if (axios.isCancel(thrown)) {
    console.log('Request canceled', thrown.message);
  } else {
    // 处理错误
  }
});

source.cancel('请求被用户取消!');
```

- `CancelToken.source()` 是一个工厂方法，它生产了一个对象，包含 `CancelToken()` 和一个默认的 `cancel()`，于是调用者就可以用下面的方法注册`CancelToken()`。

```javascript
// 方法1 - 默认的工厂方法
const CancelToken = axios.CancelToken;
const source = CancelToken.source();
axios.get('xxxxxxxxxxxx', {
  cancelToken: source.token
}).catch(function (thrown) {
  if (axios.isCancel(thrown)) {
    console.log('Request canceled', thrown.message);
  } else {
    // 处理错误
  }
});

// 方法2 - 自定义cancel
let cancel;
axios.get('xxxxxxxxxxxx', {
  cancelToken: new CancelToken(function executor(c) {
    // executor 函数接收一个 cancel 函数作为参数
    cancel = c;
  })
});

// 取消请求
source.cancel('Operation canceled by the user.');
// 或者
cancel();
```

- 调用者通过执行 `source.cancel()`,来**取消请求**，（用户可传入一个字符串，表示取消的 `message`）

下面我们看看它的内部实现。

##### Cancel 对象 -- 在取消操作时抛出

Cancel 对象的构造很简单，它要求用户传入一个可选 message。

```javascript
function Cancel(message) {
  this.message = message;
}

Cancel.prototype.toString = function toString() {
  return 'Cancel' + (this.message ? ': ' + this.message : '');
};

Cancel.prototype.__CANCEL__ = true;

module.exports = Cancel;
```

- 当 Cancel**被执行**时，表明我们的 Cancel 被初始化，我们将 `Cancel.prototype.__CANCEL__` 置为 true，表示**已经被 Cancel**

- 在请求失败时（假设用户**主动 Cancel**），那么我们最终通过获取的请求对象来判断是否为用户主动取消(也就是错误对象是不是 Cancel 对象)，axios 为我们提供了下面这个方法：

  ```javascript
  module.exports = function isCancel(value) {
    //判断请求失败时的错误对象是不是Cancel对象
    return !!(value && value.__CANCEL__);
  };
  ```

  利用之前的 `Cancel.prototype.__CANCEL__`，我们可以判断是不是用户主动取消。

##### CancelToken -- 请求取消操作的对象

`CancelToken` 是一个可用于请求取消操作的对象，它传入一个 `executor`,下面是它的代码, 一些解释我以代码注释的方式给出。

```javascript
'use strict';

var Cancel = require('./Cancel');

// CancelToken构造函数，CancelToken是一个请求取消操作的对象

function CancelToken(executor) {

  //如果executor不是function，抛出错误

  if (typeof executor !== 'function') {
    throw new TypeError('executor must be a function.');
  }

  // 初始化外部的resolvePromise
  var resolvePromise;
  this.promise = new Promise(function promiseExecutor(resolve) {
    // 让外部的 resolvePromise 指向 resolve
    // 这样的话，我们执行 resolvePromise() 就相当于将Promise resolve
    resolvePromise = resolve;
  });

  // 获取上下文 这里的token即 CancelToken对象
  var token = this;

  // 当我们的executor()被执行时，我们的resolvePromise的状态也从pending变成了resolved
  executor(function cancel(message) {
    if (token.reason) {
      // 如果CancelToken对象上已经存在reason，说明已经取消，多余的取消函数将失去作用
      return;
    }

    // 为cancelToken设置reason（一个Cancel对象）
    token.reason = new Cancel(message);

    // 在我们resolve时，触发了adapter的resolve事件。adapter
    resolvePromise(token.reason);
  });
}

// 判断请求是否已经被取消，就抛出this.reason, 也就是上面的 Cancel 对象
CancelToken.prototype.throwIfRequested = function throwIfRequested() {
  if (this.reason) {
    throw this.reason;
  }
};

// CancelToken的工厂方法
CancelToken.source = function source() {
  var cancel;
  var token = new CancelToken(function executor(c) {
    cancel = c;
  });
  return {
    token: token,
    cancel: cancel
  };
};

module.exports = CancelToken;
```

##### CancelToken 的 Promise

`CancelToken` 的 `Promise` 在适配器中被**添加处理程序**(即执行 `Promise.prototype.then()` )

```javascript
if (config.cancelToken) {
  // 处理请求取消
  config.cancelToken.promise.then(function onCanceled(cancel) {
    if (req.aborted) return;
    req.abort();
    reject(cancel);
  });
}
```

通过执行 `XMLHttpRequest.abort()`，我们达到了终止请求的目的，在之后我们执行 `reject` 来改变**适配器**的 Promise 的状态。

> 关于 XMLHttpRequest、适配器会在后文中详细讲到。

### Axios 对象

#### 构造函数

这是 Axios 对象的创建过程，代码如下，这里使用**构造函数模式**来创建。挂载了用户传入的配置，基于 `InterceptorManager()` 对象，初始化**请求拦截器**（requestInterceptor）和**
响应拦截器**(
responseInterceptor)。

```javascript
/**
 * 创建一个新的Axios实例
 *
 * @param {Object} instanceConfig The default config for the instance
 */
function Axios(instanceConfig) {
  this.defaults = instanceConfig;

  // 初始化拦截器
  this.interceptors = {
    request: new InterceptorManager(),
    response: new InterceptorManager()
  };
}
```

#### 拦截器（interceptors）

axios 一个重大的特性就是可以拦截请求和响应，调用者可以非常简单地使用下面的方法来实现请求/响应拦截。

```javascript
// 引入axios
// 添加请求拦截器
axios.interceptors.request.use(function (config) {
  // 在发送请求之前做些什么
  return config;
}, function (error) {
  // 对请求错误做些什么
  return Promise.reject(error);
});

// 添加响应拦截器
axios.interceptors.response.use(function (response) {
  // 对响应数据做点什么
  return response;
}, function (error) {
  // 对响应错误做点什么
  return Promise.reject(error);
});
```

#### InterceptorManager 对象

前面说到，在 Axios 对象创建时，初始化了两个**拦截器**（请求、响应）

```javascript
// 初始化拦截器
this.interceptors = {
  request: new InterceptorManager(),
  response: new InterceptorManager()
};
```

InterceptorManage()的代码如下。

```javascript
function InterceptorManager() {
  this.handlers = [];
}

InterceptorManager.prototype.use = function use(fulfilled, rejected) {
  this.handlers.push({
    fulfilled: fulfilled,
    rejected: rejected
  });
  return this.handlers.length - 1;
};

InterceptorManager.prototype.eject = function eject(id) {
  if (this.handlers[id]) {
    this.handlers[id] = null;
  }
};

InterceptorManager.prototype.forEach = function forEach(fn) {
  utils.forEach(this.handlers, function forEachHandler(h) {
    if (h !== null) {
      fn(h);
    }
  });
};
```

我们可以看到，构造函数初始化了一个 `handlers` 变量，是一个栈。

##### InterceptorManager.prototype.use -- 拦截器的注册

用户在执行 `axios.interceptors.request.use(fullfillFunction, rejectFunction)` 时，会将用户传入的 `fullfillFunction`, `rejectFunction`
合并成一个对象, 然后**压入 `handlers` 栈中**。

这个函数返回拦截器栈顶部元素的下标。

##### InterceptorManager.prototype.eject -- 拦截器的移除

类似的，`InterceptorManager.prototype.eject(index)` 可以用来移除一个拦截函数。

##### InterceptorManager.prototype.forEach -- 遍历、过滤拦截器

这个方法很重要，它利用我们前面说到的 `foreach` 工具函数来实现拦截器的遍历，同时过滤掉为 `null` 的拦截器项（这些 `null` 项由 `InterceptorManager.prototype.eject` 产生）

拦截器是如何工作的？我们就需要了解下面这个方法。

#### Axios.prototype.request -- 发送请求的核心

`Axios.prototype.request` 是发送请求的核心部分，它返回一个 `Promise`，内容如下：

```javascript
Axios.prototype.request = function request(config) {
  if (typeof config === 'string') {
    config = arguments[1] || {};
    config.url = arguments[0];
  } else {
    config = config || {};
  }

  config = mergeConfig(this.defaults, config);

  // 设置config.method
  if (config.method) {
    config.method = config.method.toLowerCase();
  } else if (this.defaults.method) {
    config.method = this.defaults.method.toLowerCase();
  } else {
    config.method = 'get';
  }

  // 连接拦截器中间件
  var chain = [dispatchRequest, undefined];
  // 实例化一个Promise
  var promise = Promise.resolve(config);

  this.interceptors.request.forEach(function unshiftRequestInterceptors(interceptor) {
    chain.unshift(interceptor.fulfilled, interceptor.rejected);
  });

  this.interceptors.response.forEach(function pushResponseInterceptors(interceptor) {
    chain.push(interceptor.fulfilled, interceptor.rejected);
  });

  while (chain.length) {
    promise = promise.then(chain.shift(), chain.shift());
  }

  return promise;
};
```

我们可以从中获取主要流程：

- **配置的合并**（mergeConfig()）, 合并了默认配置（this.default）和用户配置。

- **处理（用户传入的）请求方式**，默认为【GET】

- 遍历配置的拦截器，**扩展流程链**（一个列表），通过之前说到的 `forEach()` 遍历所有注册的拦截器，并添加到**流程链** `chain` 中。

    - 如果是**请求拦截器**，我们将它放到流程链的**前面**。

    - 如果是**响应拦截器**，我们将它放在流程链的**后面**。

    - 下面是一种示例情况（ `dispatchRequest()` 使用 `promise` 包装了整个网络请求，后面会详细介绍）：

    ```javascript
    let chain = [
        "请求拦截1(请求成功时)", "请求拦截1（请求失败时）",
        dispatchRequest, undefined, 
        "响应拦截1（响应成功时）", "响应拦截1（响应失败时）"
    ];
    ```

  从代码中我们可以看到，请求拦截和响应拦截以`dispatchRequest`，并且请求成功和请求失败的回调函数是**成对**的。

- **开始执行**

  ```javascript
  while (chain.length) {
    promise = promise.then(chain.shift(), chain.shift());
  }
  ```

  这里的`promise`变量在前面通过`Promise.resolve()`来初始化。这是一个`resolved`的`promise`。

  ```javascript
  var promise = Promise.resolve(config);
  ```

  :::tip promise.resolve()

  Promise 并非一开始就必须处于**pending**状态。通过调用`Promise.resolve()`静态方法，可以实例化一个**resolved**的 Promise。下面两个 Promise 实例实际上是一样的。

  ```javascript
  let p1 = new Promise((resolve, reject) => resolve());
  let p2 = Promise.resolve();
  ```
  :::

  初始化完成的`promise`进入`while`循环，自左向右遍历流程链列表。成对的移出流程链列表的头两个元素，分别称为 promise 的`resolve`和`reject`项。（同时我们也找出了流程链第二项是`undefined`的原因
  -- 作为`reject`，和作为`resolve`的`dispatchRequest`一起处理）

#### Axios.prototype[method] -- 提供请求的语法糖

`Axios.prototype[method]` 巧妙地利用上面的 `forEach` 来生成，从而扩展 `Axios.prototype` 的请求语法糖。执行这些语法糖本质上是调用了 `request()`,但是带入了**请求类型**
的配置参数。

```javascript
utils.forEach(['delete', 'get', 'head', 'options'], function forEachMethodNoData(method) {
  Axios.prototype[method] = function (url, config) {
    return this.request(mergeConfig(config || {}, {
      method: method,
      url: url,
      data: (config || {}).data
    }));
  };
});

utils.forEach(['post', 'put', 'patch'], function forEachMethodWithData(method) {
  /*eslint func-names:0*/
  Axios.prototype[method] = function (url, data, config) {
    return this.request(mergeConfig(config || {}, {
      method: method,
      url: url,
      data: data
    }));
  };
});
```

上面的代码在 `var Axios = require('./core/Axios');` 时被执行，它们遍历包含请求类型的数组，然后将支持的请求方法 `this.request` (也就是上面的 `request`)
挂载到 `Axios.prototype` 上面。

## 实例的运行(执行请求)

### dispatchRequest

`dispatchRequest(config)` 使用配置的适配器向服务器发送请求。

```javascript
module.exports = function dispatchRequest(config) {
  throwIfCancellationRequested(config);

  config.headers = config.headers || {};

  // Transform request data
  config.data = transformData(
    config.data,
    config.headers,
    config.transformRequest
  );

  // Flatten headers
  config.headers = utils.merge(
    config.headers.common || {},
    config.headers[config.method] || {},
    config.headers
  );

  utils.forEach(
    ['delete', 'get', 'head', 'post', 'put', 'patch', 'common'],
    function cleanHeaderConfig(method) {
      delete config.headers[method];
    }
  );

  var adapter = config.adapter || defaults.adapter;

  return adapter(config).then(function onAdapterResolution(response) {
    throwIfCancellationRequested(config);

    // Transform response data
    response.data = transformData(
      response.data,
      response.headers,
      config.transformResponse
    );

    return response;
  }, function onAdapterRejection(reason) {
    if (!isCancel(reason)) {
      throwIfCancellationRequested(config);

      // Transform response data
      if (reason && reason.response) {
        reason.response.data = transformData(
          reason.response.data,
          reason.response.headers,
          config.transformResponse
        );
      }
    }

    return Promise.reject(reason);
  });
};
```

自上而下解读：

- `throwIfCancellationRequested(config);` 如果请求取消，则抛出 `Cancel`。
- 确保请求头存在。
- 利用 `transformData()` 转换请求数据, `transformData()` 的主要功能是传入**formData**和**headers**，然后进行一系列处理，具体细节在后面给出。
- 利用 `utils.merge()` 处理 `config.headers.common`、`config.headers[config.method]`、`config.headers` 下的请求头，将他们**合并**、**去重**。
- 删除多余的请求头（默认的方法请求头）。
- **初始化请求适配器**，如果当前环境为浏览器，我们使用**XHR**适配器，否则（ node 环境）我们使用**HTTP**适配器。
- 带入配置，执行 adapter。
- 利用 `transformData()` 转换响应数据。

### XHR 适配器

#### 代码及解释

XHR 适配器封装了一个**Promise**，面向浏览器的**XHR**请求，本质上是封装了浏览器内置的 `XMLHttpRequest()`。

它的逻辑比上面的 HTTP 适配器简单，下面是 XHR 适配器的代码，位于 `xhr.js` 中。

由于代码较长，我以注释的形式加以解析。

一些比较重要的部分，或者需要额外解释的部分放在代码区之后逐一介绍。

```javascript
// xhr.js
// axios 的 xhr 适配器

module.exports = function xhrAdapter(config) {
  return new Promise(function dispatchXhrRequest(resolve, reject) {

    // 初始化数据和请求头
    var requestData = config.data;
    var requestHeaders = config.headers;

    // 对于FormData，Content-Type 由浏览器自行设定
    if (utils.isFormData(requestData)) {
      delete requestHeaders['Content-Type']; // Let the browser set it
    }

    // 通过 XMLHttpRequest 构造函数 生成 XHR 对象
    var request = new XMLHttpRequest();


    // HTTP basic authentication，后面会讲
    if (config.auth) {
      var username = config.auth.username || '';
      var password = config.auth.password ? unescape(encodeURIComponent(config.auth.password)) : '';
      requestHeaders.Authorization = 'Basic ' + btoa(username + ':' + password);
    }

    // 根据BaseUrl和后缀来拼接URL
    var fullPath = buildFullPath(config.baseURL, config.url);


    // 准备了一个异步的 request(只是准备、没有发送)
    request.open(config.method.toUpperCase(), buildURL(fullPath, config.params, config.paramsSerializer), true);


    // 设置超时时间 （单位为毫秒）
    request.timeout = config.timeout;


    // 每次 readyState 从一个值变成另一个值，都会触发 readystatechange 事件
    // 监听 readystatechange 事件
    request.onreadystatechange = function handleLoad() {

      // 响应阶段，细节信息我们在下面会提到
      if (!request || request.readyState !== 4) {
        return;
      }

      // 该请求出错了，我们没有得到响应, 将由 onerror 处理
      // 本地文件传输协议除外，它即使请求成功，也会返回状态为 0
      if (request.status === 0 && !(request.responseURL && request.responseURL.indexOf('file:') === 0)) {
        return;
      }

      // 获取响应头
      var responseHeaders = 'getAllResponseHeaders' in request ? parseHeaders(request.getAllResponseHeaders()) : null;

      // 获取响应数据
      var responseData = !config.responseType || config.responseType === 'text' ? request.responseText : request.response;

      // 响应
      var response = {
        data: responseData,
        status: request.status,
        statusText: request.statusText,
        headers: responseHeaders,
        config: config,
        request: request
      };

      // 处理 promise
      settle(resolve, reject, response);

      // 清理请求数据
      request = null;
    };

    // 处理下面的状态：
    // 请求被取消，更确切地来说，是非正常的取消（相对于手动取消）
    request.onabort = function handleAbort() {
      if (!request) {
        return;
      }

      reject(createError('Request aborted', config, 'ECONNABORTED', request));

      // 清理请求数据
      request = null;
    };

    // 处理一些底层的网络错误，这些错误的具体内容被浏览器所隐藏 抛出一个笼统的 Network Error
    request.onerror = function handleError() {
      // Real errors are hidden from us by the browser
      // onerror should only fire if it's a network error
      reject(createError('Network Error', config, null, request));

      // 清理请求数据
      request = null;
    };

    // 处理超时
    request.ontimeout = function handleTimeout() {
      var timeoutErrorMessage = 'timeout of ' + config.timeout + 'ms exceeded';
      if (config.timeoutErrorMessage) {
        timeoutErrorMessage = config.timeoutErrorMessage;
      }
      reject(createError(timeoutErrorMessage, config, 'ECONNABORTED',
        request));

      // 清理请求数据
      request = null;
    };

    // 添加xsrf头
    // 仅在标准浏览器环境中运行时才能执行此操作。
    // 例如 web worker 和 react-native 之类，则不会

    if (utils.isStandardBrowserEnv()) {
      // 添加xsrf头
      var xsrfValue = (config.withCredentials || isURLSameOrigin(fullPath)) && config.xsrfCookieName ?
        cookies.read(config.xsrfCookieName) :
        undefined;

      if (xsrfValue) {
        requestHeaders[config.xsrfHeaderName] = xsrfValue;
      }
    }

    // 添加请求头
    // 对每个请求头执行 setRequestHeader 函数
    if ('setRequestHeader' in request) {
      utils.forEach(requestHeaders, function setRequestHeader(val, key) {
        if (typeof requestData === 'undefined' && key.toLowerCase() === 'content-type') {
          // 如果数据未定义，则删除Content-Type
          delete requestHeaders[key];
        } else {
          // 否则，将标头添加到请求中
          request.setRequestHeader(key, val);
        }
      });
    }

    // 默认情况下，跨源请求不提供凭据（ cookie、 HTTP 认证和客户端 SSL 证书）。可以通过将
    // withCredentials 属性设置为 true 来表明请求会发送凭据。
    if (!utils.isUndefined(config.withCredentials)) {
      request.withCredentials = !!config.withCredentials;
    }

    // 如果用户设置了响应类型，则处理之。
    // 主要的响应类型列举如下：
    // "arraybuffer" "blob" "document" "json" "text";
    if (config.responseType) {
      try {
        request.responseType = config.responseType;
      } catch (e) {
        // 浏览器预期抛出的DOMException不兼容 XMLHttpRequest Level 2。
        // 但是，对于“json”类型，可以取消此设置，因为可以默认使用transformResponse功能对其进行解析。
        if (config.responseType !== 'json') {
          throw e;
        }
      }
    }

    // 下载事件  我们可以通过这个属性来实现对下载进度的监控。
    if (typeof config.onDownloadProgress === 'function') {
      request.addEventListener('progress', config.onDownloadProgress);
    }

    // 上传事件，注意: 并非所有浏览器都支持上传事件
    // 我们可以通过这个属性来实现对上传进度的监控。
    if (typeof config.onUploadProgress === 'function' && request.upload) {
      request.upload.addEventListener('progress', config.onUploadProgress);
    }


    if (config.cancelToken) {
      // 处理取消行为
      config.cancelToken.promise.then(function onCanceled(cancel) {
        if (!request) {
          return;
        }

        request.abort();
        reject(cancel);
        // 清理请求
        request = null;
      });
    }

    if (!requestData) {
      // 清理请求
      requestData = null;
    }

    // 发送请求
    request.send(requestData);
  });
};
```

上面的代码 + 注释已经大致概括了整个过程，下面是一些细节介绍。

> 除非特殊注明，下面的代码块中的所有代码都来自`xhr.js`。

#### 核心内容 - XMLHttpRequest

`XMLHttpRequest`是 Ajax 风格通信的一种具体实现，这个对象最早由微软发明，然后被其他浏览器所借鉴。这个接口可以实现：

- **异步**从服务器获取额外数据，即用户点击不用页面刷新也可以获取数据
- 在页面**已加载后**从服务器请求/接收数据
- 在**后台**向服务器发送数据

上面的代码中出现了许多 XHR 的内容，下面给出解释，对于更多的`XMLHttpRequest`相关内容，请自行参阅相关文档。

##### open() - 请求的准备

使用 XHR 对象首先要调用 open()方法，这个方法接收 3 个参数：**请求类型**（ GET、 POST 等）、**请求 URL**，以及表示请求是否异步的布尔值。

例如上面的代码中有如下内容：

```javascript
// 请求的准备
request.open(config.method.toUpperCase(), buildURL(fullPath, config.params, config.paramsSerializer), true);
```

这段代码表示，为 `request` 这个 `XMLHttpRequest` 对象**准备**请求，**请求方法、url 均来自用户配置**，且这个请求为异步请求。

##### send() - 请求的正式执行

send()用来发送定义好的请求， send()方法接收一个参数，是**作为请求体发送的数据**。如果不需要发送请求体，则必须传 null，因为这个参数在某些浏览器中是必需的。

##### readyState - 请求的阶段

在实际情况下，我们更期望使用**异步请求**，于是**监听请求状态**就成了一个必需，XHR 有一个 `readyState` 属性可供使用，可能的值如下所示：

- 0：**未初始化** (Uninitialized)。尚未调用 `open()` 方法。
- 1：**已打开** (Open)。已调用 `open()` 方法，尚未调用 `send()` 方法。
- 2：**已发送**  (Sent)。已调用 `send()` 方法，尚未收到响应。
- 3：**接收中** (Receiving)。已经收到部分响应。
- 4：**完成** (Complete)。已经收到所有响应。

##### onreadystatechange - 阶段监听

每次 `readyState` 从一个值变成另一个值，都会触发 `readystatechange`事件。

基于上面两个 API，我们来查看下面的代码，这些代码是 XHR 适配器的**监听部分**，其中，一些处理加工响应内容的代码已经被省略。

```javascript
// 每次 readyState 从一个值变成另一个值，都会触发 readystatechange 事件
// 监听 readystatechange 事件
request.onreadystatechange = function handleLoad() {
  // 响应阶段，细节信息我们在下面会提到
  if (!request || request.readyState !== 4) {
    return;
  }
  // 省略一些响应的处理部分

  // 处理 promise
  settle(resolve, reject, response);
};
```

如果`readyState` 不为**4**，也就是不处在**完成** (Complete，已经收到所有响应)状态，我们及时 `return` 来提早结束函数以继续监听。

当 `readyState` 为**4**时，我们进行一系列处理，然后执行 `settle()`。

##### abort() - 请求的终止

如果该请求已被发出，`XMLHttpRequest.abort()` 方法将终止该请求。当一个请求被终止，它的 `readyState` 将被置为 `XMLHttpRequest.UNSENT`，并且请求的`status`置为 0。

##### settle() - 根据响应结果更新 Promise

`settle` 函数用来处理**Promise**（改变状态），根据**响应信息**来进行 `resolve` 或者 `reject`，内容如下：

```javascript
// settle.js
module.exports = function settle(resolve, reject, response) {
  var validateStatus = response.config.validateStatus;
  if (!response.status || !validateStatus || validateStatus(response.status)) {
    resolve(response);
  } else {
    reject(createError(
      'Request failed with status code ' + response.status,
      response.config,
      null,
      response.request,
      response
    ));
  }
};
```

- `settle()` 接收三个参数，resolve promise 的函数、reject promise 的函数、响应状态。

- `settle()` **根据用户的响应状态**来决定到底是 `resolve` 还是 `reject`

- 在上面的代码中，如果`response.status`不为 0，或者符合用户配置中传入的自定义验证函数，执行 `resolve`，反之执行 `reject`。

- 默认的自定义验证函数如下, 当状态码为**2XX**（代表请求已成功被服务器接收、理解、并接受）时，执行 `resolve`。

  ```javascript
   (status: number) => status >= 200 && status < 300
  ```

##### onerror

`onerror` 是 XMLHttpRequest 由于错误而失败时调用的函数。用于处理一些底层的网络错误，这些错误的具体内容被浏览器所隐藏， axios 会抛出一个笼统的`Network Error`。

#### HTTP basic authentication

在 HTTP 中，**Basic Authorization**基本认证是一种用来允许 Web 浏览器或其他客户端程序在请求时提供用户名和口令形式的身份凭证的一种登录验证方式。

##### 实现方式

请看来自 XHR 适配器的一部分代码:

```javascript
 // HTTP basic authentication
if (config.auth) {
  var username = config.auth.username || '';
  var password = config.auth.password ? unescape(encodeURIComponent(config.auth.password)) : '';
  requestHeaders.Authorization = 'Basic ' + btoa(username + ':' + password);
}
```

代码首先查看`config.auth`（用户配置的 auth）是否存在，然后从中获取用户名和密码，之后将我们的`Authorization`请求头赋值为以下内容：

```javascript
requestHeaders.Authorization = 'Basic ' + btoa(username + ':' + password);
```

这就是`HTTP basic authentication`的主体，分为两部分：

- `'Basic '` 字符串（注意有个空格）
- 拼接过后的用户名和密码(以冒号分割)，并且，这部分内容会用`Base64`编码处理。

##### 缺陷

通过上面的实现方式，我们不难发现一些安全性问题成为`HTTP basic authentication`的重大缺陷。

- 用户名和密码以**明文**（Base64，可以被解码）传输，需要配合**HTTPS**来保证信息传输的安全。

- 即使密码被强加密，第三方仍可通过加密后的用户名和密码进行**重放攻击**。

- 没有提供任何针对代理和中间节点的防护措施。

- 假冒服务器很容易骗过认证，诱导用户输入用户名和密码。

#### XSRF（**CSRF**）跨站请求伪造

axios 的 Features 之一（原文）: Client side support for protecting against（客户端支持防止 XSRF）

**跨站请求伪造**（英语：Cross-site request forgery），也被称为 **one-click attack** 或者 **session riding**，通常缩写为 **CSRF** 或者 **XSRF**。 **
在未授权系统可以访问某个资源**时，可以将其视为跨站点请求伪造攻击。未授权系统会按照处理请求的服务器的要求**伪装自己**。

##### 处理手段

- 要求通过 SSL 访问能够被 Ajax 访问的资源
- 要求每个请求都发送一个按约定算法计算好的令牌（token），可以使用**JWT 方案**或者**页面内嵌 Token**。

:::tip

注意：以下手段对防护 CSRF 攻击是不安全的

- 要求 POST 而非 GET 请求（很容易修改请求方法）
- 使用 referrer URL 验证来源（很容易伪造）
- 基于 cookie 验证（很容易伪造）
  :::

##### axios 中的处理方式

回到源码，我们来看看 axios 是如何处理的。

```javascript
// 添加xsrf头
// 仅在标准浏览器环境中运行时才能执行此操作。
// 例如 web worker 和 react-native 之类，则不会

if (utils.isStandardBrowserEnv()) {
  // 添加xsrf头
  var xsrfValue = (config.withCredentials || isURLSameOrigin(fullPath)) && config.xsrfCookieName ? cookies.read(config.xsrfCookieName) : undefined;
  if (xsrfValue) {
    requestHeaders[config.xsrfHeaderName] = xsrfValue;
  }
}
```

- 判断是否在标准浏览器环境。

- 生成 XSRF 请求头的值。

    - 用户配置中是否传入了`withCredentials` (跨域请求凭证)

    - 通过 `isURLSameOrigin(fullPath)`确定 URL 是否与当前位置具有相同的来源（**如果域名或 IP 地址、端口与协议都相同，那么就会被判定为同源**）

    - 上述两个条件有一个满足时，检查`xsrfCookieName`(用作 xsrf token 的值的 cookie 的名称)，如果存在，通过`cookies.read()`读取这个 cookie，否则置为`undefined`

    - 经过上面的赋值，如果最终的值存在，则设置请求头，请求头的名称由配置`config.xsrfHeaderName`决定。

综上所述，它防止攻击的原理是：

通过用户配置的`config.xsrfHeaderName`和`config.xsrfCookieName`。在每次发送请求的时候，会自动从 `cookie` 中读取对应的 `token` 值，然后将其添加到请求 `headers`
中。这个`token`由服务端颁发，服务端收到`token`会验证合法性选择接受或者拒绝服务，由于这个 `token`
是很难伪造的，所以就能区分这个请求是否是用户正常发起的。（当然，还是需要前后端配合，axios 在这方面只是为我们提供了一个便于配置的环境，让我们不需要额外处理）

:::tip

XSS 漏洞可能会泄露 token，例如，用户的 token 存入 localstorage 中，注入的 js 代码可以轻松地获取 token
:::

#### 多次出现的 request = null

上面的代码中出现了很多将**XMLHTTPRequest**对象置为空的代码：

```javascript
// 一系列操作结束
// Clean up request
request = null;
```

这种操作被称为**解除引用**，优化内存占用的最佳手段就是保证在执行代码时只保存必要的数据。如果数据不再必要，那么把它设置为 **null**，从而释放其引用。

我们来看下面代码（摘自《javascript 高级程序设计》）

```javascript
function createPerson(name) {
  let localPerson = new Object();
  localPerson.name = name;
  return localPerson;
}

let globalPerson = createPerson("Nicholas");

// 解除 globalPerson 对值的引用
globalPerson = null;
```

对上面代码的解读：

- `createPerson(name)` 运用**工厂模式**创建一个特定对象，返回值 `localPerson` 便是我们创建的对象，赋值给了 `globalPerson`。
- 变量 `globalPerson` 保存着 `createPerson()` 函数调用返回的值。
- `localPerson` 在 `createPerson()` 执行完成超出上下文后会**自动解除引用**，不需要显式处理。
- 但 `globalPerson` 是一个**全局变量**，应该在不再需要时手动解除其引用。
- 最后一行就是解除引用的方式。

用户在访问一个网页的过程中可能会发起大量请求，axios 在发起一个请求时，都会创建一个 `XMLHTTPRequest()` 对象。

```javascript
// 通过 XMLHttpRequest 构造函数 生成 XHR 对象
var request = new XMLHttpRequest();
```

在上面的代码中，变量 `request` 保存着 `XMLHttpRequest()` 构造函数的返回值。 **请求——响应**整个过程结束之后应该**及时手动地解除引用**。

### HTTP 适配器

**http 适配器**封装了一个 Promise，用于执行**http**请求，服务于**Node.js 环境**，它的代码如下，由于代码较长，我以注释的形式加以解析。

#### 代码及解释

```javascript
module.exports = function httpAdapter(config) {
  return new Promise(function dispatchHttpRequest(resolvePromise, rejectPromise) {
    // 初始化配置
    var resolve = function resolve(value) {
      resolvePromise(value);
    };
    var reject = function reject(value) {
      rejectPromise(value);
    };
    var data = config.data;
    var headers = config.headers;

    // 设置默认的用户代理（某些服务器需要）
    if (!headers['User-Agent'] && !headers['user-agent']) {
      headers['User-Agent'] = 'axios/' + pkg.version;
    }

    // 二进制数据流
    if (data && !utils.isStream(data)) {
      // Buffer代表一个缓冲区，主要用于操作二进制数据流
      if (Buffer.isBuffer(data)) {
        // Nothing to do...
      } else if (utils.isArrayBuffer(data)) {
        data = Buffer.from(new Uint8Array(data));
      } else if (utils.isString(data)) {
        data = Buffer.from(data, 'utf-8');
      } else {
        // 转换条件错误
        // 转换后的数据必须是字符串，ArrayBuffer，Buffer 或 Stream
        return reject(createError(
          'Data after transformation must be a string, an ArrayBuffer, a Buffer, or a Stream',
          config
        ));
      }

      // 如果数据存在，添加 Content-Length 标头
      headers['Content-Length'] = data.length;
    }

    // HTTP Basic Auth, 用于权限相关的处理
    var auth = undefined;
    if (config.auth) {
      var username = config.auth.username || '';
      var password = config.auth.password || '';
      // 拼接auth字符串
      auth = username + ':' + password;
    }

    // 处理请求url， 通过baseURL（如果有的话），和后缀url来进行拼接
    // 仅当请求的URL不是绝对URL时，
    // 才通过将baseURL与请求的URL组合在一起来创建新的URL。
    var fullPath = buildFullPath(config.baseURL, config.url);

    // 处理 fullPath（这里的 parse 调用了一个第三方的的url处理库，细节代码比较复杂）
    var parsed = url.parse(fullPath);

    // 处理协议相关
    var protocol = parsed.protocol || 'http:';

    // 当url中带有权限相关内容时，我们重写 auth 变量
    if (!auth && parsed.auth) {
      var urlAuth = parsed.auth.split(':');
      var urlUsername = urlAuth[0] || '';
      var urlPassword = urlAuth[1] || '';
      auth = urlUsername + ':' + urlPassword;
    }

    // 如果我们通过赋值auth对象的方式来生成Authorization请求头，那么我们删除默认的请求头
    if (auth) {
      delete headers.Authorization;
    }

    // 运用正则表达式 /https:?/ 进行https的判断
    var isHttpsRequest = isHttps.test(protocol);

    // `httpAgent` 和 `httpsAgent` 分别在 node.js 中用于定义在执行 http 和 https 时使用的自定义代理
    var agent = isHttpsRequest ? config.httpsAgent : config.httpAgent;

    // 汇总配置
    var options = {
      // 这里的build url 在url 的末尾附加了一系列参数
      // 如果用户没有传入自定义的 config.paramsSerializer(序列化函数) 那么序列化将按照默认的方式进行
      path: buildURL(parsed.path, config.params, config.paramsSerializer).replace(/^\?/, ''),
      method: config.method.toUpperCase(),
      headers: headers,
      agent: agent,
      agents: {http: config.httpAgent, https: config.httpsAgent},
      auth: auth
    };

    if (config.socketPath) {
      options.socketPath = config.socketPath;
    } else {
      // 配置主机名和端口
      options.hostname = parsed.hostname;
      options.port = parsed.port;
    }

    // 代理配置 'proxy' 定义代理服务器的主机名称和端口
    var proxy = config.proxy;
    if (!proxy && proxy !== false) {
      var proxyEnv = protocol.slice(0, -1) + '_proxy';
      var proxyUrl = process.env[proxyEnv] || process.env[proxyEnv.toUpperCase()];
      if (proxyUrl) {
        var parsedProxyUrl = url.parse(proxyUrl);
        var noProxyEnv = process.env.no_proxy || process.env.NO_PROXY;
        var shouldProxy = true;

        if (noProxyEnv) {
          var noProxy = noProxyEnv.split(',').map(function trim(s) {
            return s.trim();
          });

          shouldProxy = !noProxy.some(function proxyMatch(proxyElement) {
            if (!proxyElement) {
              return false;
            }
            if (proxyElement === '*') {
              return true;
            }
            if (proxyElement[0] === '.' &&
              parsed.hostname.substr(parsed.hostname.length - proxyElement.length) === proxyElement) {
              return true;
            }

            return parsed.hostname === proxyElement;
          });
        }


        if (shouldProxy) {
          proxy = {
            host: parsedProxyUrl.hostname,
            port: parsedProxyUrl.port
          };

          if (parsedProxyUrl.auth) {
            var proxyUrlAuth = parsedProxyUrl.auth.split(':');
            proxy.auth = {
              username: proxyUrlAuth[0],
              password: proxyUrlAuth[1]
            };
          }
        }
      }
    }

    if (proxy) {
      options.hostname = proxy.host;
      options.host = proxy.host;
      options.headers.host = parsed.hostname + (parsed.port ? ':' + parsed.port : '');
      options.port = proxy.port;
      options.path = protocol + '//' + parsed.hostname + (parsed.port ? ':' + parsed.port : '') + options.path;

      // 基本代理授权
      if (proxy.auth) {
        var base64 = Buffer.from(proxy.auth.username + ':' + proxy.auth.password, 'utf8').toString('base64');
        options.headers['Proxy-Authorization'] = 'Basic ' + base64;
      }
    }

    var transport;

    // https 代理配置
    var isHttpsProxy = isHttpsRequest && (proxy ? isHttps.test(proxy.protocol) : true);
    if (config.transport) {
      transport = config.transport;
    } else if (config.maxRedirects === 0) {
      transport = isHttpsProxy ? https : http;
    } else {
      // 定义在 node.js 中 follow 的最大重定向数目
      if (config.maxRedirects) {
        options.maxRedirects = config.maxRedirects;
      }

      // 使用重定向功能包装协议
      transport = isHttpsProxy ? httpsFollow : httpFollow;
    }

    if (config.maxBodyLength > -1) {
      options.maxBodyLength = config.maxBodyLength;
    }

    // 创建请求 调用了nodejs原生的API 即 http.request(options[,callback])
    var req = transport.request(options, function handleResponse(res) {
      if (req.aborted) return;

      // uncompress the response body transparently if required
      var stream = res;

      // return the last request in case of redirects
      var lastRequest = res.req || req;


      // if no content, is HEAD request or decompress disabled we should not decompress
      // 如果没有内容，体现为状态码204 -- 对于一些提交到服务器处理的数据,只需要返回是否成功的情况下,可以考虑使用状态码204
      // head 请求 -- 检查资源的有效性，也是没有消息体的
      // 解压缩被禁用
      if (res.statusCode !== 204 && lastRequest.method !== 'HEAD' && config.decompress !== false) {
        // 获取内容的编码方式
        switch (res.headers['content-encoding']) {
          /*eslint default-case:0*/
          case 'gzip':
          case 'compress':
          case 'deflate':
            // add the unzipper to the body stream processing pipeline
            stream = stream.pipe(zlib.createUnzip());

            // remove the content-encoding in order to not confuse downstream operations
            delete res.headers['content-encoding'];
            break;
        }
      }

      // 响应配置
      var response = {
        status: res.statusCode,
        statusText: res.statusMessage,
        headers: res.headers,
        config: config,
        request: lastRequest
      };

      // 流式文件
      if (config.responseType === 'stream') {
        response.data = stream;
        // 这个函数根据响应状态解决或拒绝Promise：
        // 它会 查看response的 status 根据状态来决定 resolve 还是 reject
        settle(resolve, reject, response);

      } else {
        var responseBuffer = [];
        // 获取数据事件
        stream.on('data', function handleStreamData(chunk) {
          responseBuffer.push(chunk);

          // 如果指定 maxContentLength ，请确保内容长度不超过maxContentLength, 否则我们执行reject
          if (config.maxContentLength > -1 && Buffer.concat(responseBuffer).length > config.maxContentLength) {
            stream.destroy();
            reject(createError('maxContentLength size of ' + config.maxContentLength + ' exceeded',
              config, null, lastRequest));
          }
        });

        // 错误事件
        stream.on('error', function handleStreamError(err) {
          if (req.aborted) return;
          reject(enhanceError(err, config, null, lastRequest));
        });

        // 请求结束事件
        stream.on('end', function handleStreamEnd() {

          // 连接缓冲区数组
          // 如果列表中有多个项目，则创建一个新的缓冲区。
          var responseData = Buffer.concat(responseBuffer);

          if (config.responseType !== 'arraybuffer') {
            // 转换成字符串
            responseData = responseData.toString(config.responseEncoding);
            if (!config.responseEncoding || config.responseEncoding === 'utf8') {
              responseData = utils.stripBOM(responseData);
            }
          }

          response.data = responseData;
          // 在上面的文章里已经提到了这个函数
          // 这个函数根据响应状态解决或拒绝Promise：
          // 它会 查看response的 status 根据状态来决定 resolve 还是 reject
          settle(resolve, reject, response);
        });
      }
    });

    // 处理错误
    req.on('error', function handleRequestError(err) {
      if (req.aborted && err.code !== 'ERR_FR_TOO_MANY_REDIRECTS') return;
      reject(enhanceError(err, config, null, req));
    });

    // 处理请求超时
    if (config.timeout) {
      // 有时，响应将非常缓慢，并且没有响应，connect事件将被事件循环系统阻止。
      // 并且将触发计时器回调，并在连接之前调用abort（），然后获取“套接字挂起”和代码ECONNRESET。
      // 这时，如果我们有大量请求，nodejs将在后台挂断一些套接字。而且这个数字会不断增加。
      // 然后这些挂断的套接字将逐渐使CPU变得更糟。
      // ClientRequest.setTimeout将在指定的毫秒内触发，并可以确保在连接后将触发abort（）。
      req.setTimeout(config.timeout, function handleRequestTimeout() {
        req.abort();
        reject(createError('timeout of ' + config.timeout + 'ms exceeded', config, 'ECONNABORTED', req));
      });
    }

    if (config.cancelToken) {
      // Handle cancellation
      config.cancelToken.promise.then(function onCanceled(cancel) {
        if (req.aborted) return;

        req.abort();
        reject(cancel);
      });
    }

    // 发送请求
    if (utils.isStream(data)) {
      data.on('error', function handleStreamError(err) {
        reject(enhanceError(err, config, null, req));
      }).pipe(req);
    } else {
      req.end(data);
    }
  });
};
```

#### Buffer (缓冲区)

JavaScript 语言自身只有字符串数据类型，没有二进制数据类型。

但在处理像**TCP 流**或**文件流**时，必须使用到二进制数据。因此在 Node.js 中，定义了一个 Buffer 类，该类用来创建一个专门存放二进制数据的缓存区。

在 Node.js 中，Buffer 类是随 Node 内核一起发布的核心库。Buffer 库为 Node.js 带来了一种存储原始数据的方法，可以让 Node.js 处理二进制数据。

请看下面的代码，这是 http 适配器对 data 进行**预处理**的部分。

```javascript
    // 二进制数据流
if (data && !utils.isStream(data)) {
  // Buffer代表一个缓冲区，主要用于操作二进制数据流
  if (Buffer.isBuffer(data)) {
    // Nothing to do...
  } else if (utils.isArrayBuffer(data)) {
    data = Buffer.from(new Uint8Array(data));
  } else if (utils.isString(data)) {
    data = Buffer.from(data, 'utf-8');
  } else {
    // 转换条件错误
    // 转换后的数据必须是字符串，ArrayBuffer，Buffer 或 Stream
    return reject(createError(
      'Data after transformation must be a string, an ArrayBuffer, a Buffer, or a Stream',
      config
    ));
  }
  // 如果数据存在，添加 Content-Length 标头
  headers['Content-Length'] = data.length;
}
```

- 首先读取 `config` 的 `data`(用户传入的配置)，然后判断 data 是否为二进制数据流，如果不是，开始执行下面的分支处理。

- 如果是 `ArrayBuffer`, 我们调用 `Buffer.from(new Uint8Array(data))` 将其转为 `Buffer`。

- 如果是 `String`，我们调用 `Buffer.from(data, 'utf-8')` 将其转为 `Buffer`。

- 如果以上转换条件都不符合，我们抛出异常，并将 `Promise` 的状态置为 `reject`。

- 设置 `Content-Length` 请求头。

#### Proxy - 代理

从上面可以看出，axios 为我们提供了代理请求的接口。

从概念上来说，代理服务器(Proxy Server)是一种代理网络用户去取得网络信息的存在，是一种网络信息中转站。比如说你要访问 C 网站，你可以告诉代理服务器 B -- 我要访问 C 网站，代理服务器访问 C 网站然后将 C 网站的内容返回给你。

代理服务的优点：

- 一个 lP 地址或 Internet 帐户供多个用户同时使用
- 缓存功能，可以降低费用，提高速度
- 对内部网络用户进行权限和信息流量计费管理
- 对进入内部网络的 Internet 信息实施监控和过滤

## 异常处理

使用适当的信息创建自定义错误可以有效提高代码的可维护性。 我们来看 axios 内部如何实现**异常处理**。

#### createError.js

```javascript
module.exports = function createError(message, config, code, request, response) {
  var error = new Error(message);
  return enhanceError(error, config, code, request, response);
};
```

`createError()` 可以使用使用指定的消息，配置，错误代码，请求和响应来创建错误。

例如，axios 在收到非**2XX - 正常**的返回时，就会 `reject` Promise，并且抛出一个 `createError`

```javascript
reject(createError(
  'Request failed with status code ' + response.status,
  response.config,
  null,
  response.request,
  response
));
```

#### enhanceError.js

`createError()` 最终返回一个 `enhanceError()`，是一个默认异常的**扩展**（enhance），也是自定义异常的核心所在。

`enhanceError()` 传入一个 `error` 对象以及一系列响应、请求的配置，来扩展这个 `Error`，这包括：

- 将用户配置、请求对象（如果有的话）、响应对象（如果有的话）、响应（错误）码带入 error 中。
- 附加一个 `toJson()` 方法
- 值得注意的是，不同浏览器的 `Error()` 对象的成员变量可能有差别，下面的注释就体现了这一点。

```javascript
module.exports = function enhanceError(error, config, code, request, response) {
  error.config = config;
  if (code) {
    error.code = code;
  }

  error.request = request;
  error.response = response;
  error.isAxiosError = true;

  error.toJSON = function toJSON() {
    return {
      // Standard
      message: this.message,
      name: this.name,
      // Microsoft
      description: this.description,
      number: this.number,
      // Mozilla
      fileName: this.fileName,
      lineNumber: this.lineNumber,
      columnNumber: this.columnNumber,
      stack: this.stack,
      // Axios
      config: this.config,
      code: this.code
    };
  };
  return error;
};
```

> 注意 `toJSON()` 函数中 `this` 的指向。`this` 到底引用哪个对象必须到**函数被调用时**才可以确定。在 `toJson()` 执行时，this 引用了 `error`

## 参考资料

| 标题                                      | 来源                                                   |
| ----------------------------------------- | ------------------------------------------------------ |
| axios GitHub 仓库                          | https://github.com/axios/axios                         |
| 前端安全系列之二：如何防止 CSRF 攻击        | https://zhuanlan.zhihu.com/p/46592479                  |
| axios 中文文档                             | http://www.axios-js.com/zh-cn/                         |
| XMLHttpRequest Living Standard            | https://xhr.spec.whatwg.org/#send-flag                 |
| 《JavaScript 高级程序设计》                | ---                                                    |
| Node.js Buffer(缓冲区)                    | https://www.runoob.com/nodejs/nodejs-buffer.html       |
| Axios 源码解析 —— 一个小而美的 HttpClient | https://zhuanlan.zhihu.com/p/104568514                 |
| 使用 Typescript 重构 axios                   | https://www.cnblogs.com/wangjiachen666/p/11234163.html |
