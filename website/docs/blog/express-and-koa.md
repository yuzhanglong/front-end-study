# express & koa 框架对比及原理分析

[[toc]]

## 总述

本文将结合源码剖析 **node.js** 的两款优秀框架 **express** 和 **koa** 的原理。本文假设读者已对这两款框架有所了解，并会简单使用。

## express

### 中间件的注册

我们从下面这个 DEMO 开始讲起，它可以启动一个 express 服务器：

```javascript
const express = require("express");

const app = express();

app.use(/* 中间件 M1 */ (req, res, next) => {
  console.log("middleware 01 in app.use");
  next();
}, /* 中间件 M2 */ (req, res, next) => {
  console.log("middleware 02 in app.use");
  next();
});

app.get('/home', /* 中间件 M3 */ (req, res, next) => {
  console.log("home and get method middleware 01");
  next();
}, /* 中间件 M4 */ (req, res, next) => {
  console.log("home and get method middleware 02");
  next();
}, /* 中间件 M5 */ (req, res, next) => {
  console.log("home and get method middleware 03");
  res.end("hello world");
});


app.listen(8000, () => {
  console.log("your project is running successfully!");
});
```

其中，函数体 `(req, res, next) => {}` 被称为**中间件函数**（下文所有提到的中间件函数均指这种形式的函数体），中间件函数能够访问请求对象 (req)、响应对象 (res)
以及应用程序的请求/响应循环中的下一个中间件函数。下一个中间件函数通常由名为 **next** 的变量来表示，通过调用函数 `next()` 可以将控制权转移到下一个中间件函数。

#### express 应用的创建 -- require("express")

我们都知道，`require("express")` 所得到的值是一个函数，JavaScript 中的函数也是对象，所以它可以拥有各种成员变量例如 `app.use`，点进去我们就可以看到它的实现 `createApplication()`
：

```javascript
exports = module.exports = createApplication;

function createApplication() {
  var app = function (req, res, next) {
    app.handle(req, res, next);
  };

  mixin(app, EventEmitter.prototype, false);
  mixin(app, proto, false);

  // expose the prototype that will get set on requests
  app.request = Object.create(req, {
    app: {configurable: true, enumerable: true, writable: true, value: app}
  })

  // expose the prototype that will get set on responses
  app.response = Object.create(res, {
    app: {configurable: true, enumerable: true, writable: true, value: app}
  })

  app.init();
  return app;
}
```

app 从一个中间件函数开始，调用 app 会执行 `app.handle(req, res, next)`

接着，通过 `mixin` 方法将一些成员合并到 app 上，然后执行一些初始化工作：

```javascript
mixin(app, EventEmitter.prototype, false);
mixin(app, proto, false);
```

我们常见的 `app.use()`、`app.get()` 方法就是来自上面的 `proto`，下面我们分析 `app.use()`。

#### app.use() -- 中间件注册

这个函数要求我们传入一个中间件函数，我们可以传入一个路径 + 一个或多个中间件函数，或者仅传入一个或多个中间件函数。它的流程如下：

- 在 this.lazyrouter() 之前的代码都是处理参数的，它会从参数中拿到路径（如果有的话）和若干个中间件函数，并调用 `flatten` 来将他们扁平化（其实就是把它们传到一个数组里面了）：
- 调用 `this.lazyrouter()` 初始化路由，接下来会讲。
- 利用 `Array.prototype.forEach()` 遍历上面扁平化的 `fns`。
- 在 forEach 回调函数体中，普通的中间件会执行 `router.use(path, fn)`。
- 最后，返回 **this**，也就是 **app**。

```javascript
app.use = function use(fn) {
  var offset = 0;
  var path = '/';

  // default path to '/'
  // disambiguate app.use([fn])
  if (typeof fn !== 'function') {
    var arg = fn;

    while (Array.isArray(arg) && arg.length !== 0) {
      arg = arg[0];
    }

    // first arg is the path
    if (typeof arg !== 'function') {
      offset = 1;
      path = fn;
    }
  }

  var fns = flatten(slice.call(arguments, offset));

  if (fns.length === 0) {
    throw new TypeError('app.use() requires a middleware function')
  }

  // setup router
  this.lazyrouter();
  var router = this._router;

  fns.forEach(function (fn) {
    // non-express app
    if (!fn || !fn.handle || !fn.set) {
      return router.use(path, fn);
    }

    debug('.use app under %s', path);
    fn.mountpath = path;
    fn.parent = this;

    // restore .app property on req and res
    router.use(path, function mounted_app(req, res, next) {
      var orig = req.app;
      fn.handle(req, res, function (err) {
        setPrototypeOf(req, orig.request)
        setPrototypeOf(res, orig.response)
        next(err);
      });
    });

    // mounted an app
    fn.emit('mount', this);
  }, this);

  return this;
};
```

我们可以提炼出两个核心方法，一个是 `this.lazyrouter()`，还有一个是 `router.use(path, fn)`。

#### this.lazyrouter() -- 全局路由初始化

```javascript
app.lazyrouter = function lazyrouter() {
  if (!this._router) {
    this._router = new Router({
      caseSensitive: this.enabled('case sensitive routing'),
      strict: this.enabled('strict routing')
    });

    this._router.use(query(this.get('query parser fn')));
    this._router.use(middleware.init(this));
  }
};
```

这个函数用来初始化路由，如果 `this._router` 不存在（这里的 this 是 app），那么我们会 new 一个 **Router** 对象，并赋值给它。

然后执行 `this._router` 的 `use` 方法，**注册了两个中间件** `query(this.get('query parser fn'))` 和 `middleware.init(this)`。

还记得上面对用户传入的中间件函数的遍历吗？express 对每一个中间件函数都会调用 `router.use(path, fn)` 方法。所以 `app.use(middleWares)`
**本质上**就是 `router.use(middleWares)`

也就是说，中间件会被注册到**相对应的路由（Router 对象）**中。在上面的代码中就是全局路由，相应的路径为 `/`。接下来我们分析 `router.use(path, fn)`。#中间件的注册

#### router.use(path, fn)

这个函数位于 `router/index.js` 下，我们注意到：

- 首先还是进行参数处理，扁平化若干个中间件函数，如果数量为 0 会抛出异常。
- 遍历每个中间件函数，对每个中间件函数，我们会 new 一个 **Layer** 对象出来，然后把这个对象 push 到一个栈中，根据 this 的指向，这个栈是属于 Router 对象的，在这里是全局 Router 对象。
- 最终返回 this，也就是 router 对象。

```javascript
proto.use = function use(fn) {
  var offset = 0;
  var path = '/';

  // default path to '/'
  // disambiguate router.use([fn])
  if (typeof fn !== 'function') {
    var arg = fn;

    while (Array.isArray(arg) && arg.length !== 0) {
      arg = arg[0];
    }

    // first arg is the path
    if (typeof arg !== 'function') {
      offset = 1;
      path = fn;
    }
  }

  var callbacks = flatten(slice.call(arguments, offset));

  if (callbacks.length === 0) {
    throw new TypeError('Router.use() requires a middleware function')
  }

  for (var i = 0; i < callbacks.length; i++) {
    var fn = callbacks[i];

    // add the middleware
    debug('use %o %s', path, fn.name || '<anonymous>')

    var layer = new Layer(path, {
      sensitive: this.caseSensitive,
      strict: false,
      end: false
    }, fn);

    layer.route = undefined;

    this.stack.push(layer);
  }
  return this;
};
```

综上所述，我们可以轻松得出以下结论：

- app.use 在没有传路径时会以 `/` 也就是全局路由作为路径。
- `/` 在 express 底层代表了一个 Router 对象，它维护了一个**栈**，栈中的每一个元素被称为层（即上面的 Layer 对象），每一层维护相应的中间件函数。
- 中间件的注册本质上就是将一个或者多个中间件函数压入对应的路由栈。

带着这个结论，我们再来看看 `app[method]` 方法。

#### app[method] 方法

`app[method]()` 代码如下，它位于 **lib/application.js** 目录下：

```javascript
methods.forEach(function (method) {
  app[method] = function (path) {
    if (method === 'get' && arguments.length === 1) {
      // app.get(setting)
      return this.set(path);
    }

    this.lazyrouter();

    var route = this._router.route(path);
    route[method].apply(route, slice.call(arguments, 1));
    return this;
  };
});
```

- 首先通过 `this.lazyrouter()` 初始化 全局 router（如果没有被初始化过）。
- 接着执行 `this._router.route(path)` 来初始化**当前路径**所对应的路由，在上面的 DEMO 中，当前路径为 `/home`。
- 然后执行 `route[method]`。

所以 app[method] 的本质就是为所配置的路径初始化对应的路由，然后执行 `route[method]`。

下面是 `this._router.route(path)` 代码：

- 它以我们设置的路径为参数， new 了一个 **Route** 对象。
- 初始化了一个 **Layer**，之后将这个 Layer 压入栈中，注意，这里的 `this` 为 `app._router`，也就是全局 router 对象。

```javascript
proto.route = function route(path) {
  var route = new Route(path);

  var layer = new Layer(path, {
    sensitive: this.caseSensitive,
    strict: this.strict,
    end: true
  }, route.dispatch.bind(route));

  layer.route = route;

  this.stack.push(layer);
  return route;
};
```

如果对前面的代码还有印象的话，在执行 `new Layer()` 时，我们传入的第二个参数是我们的中间件函数，在这里是 `route.dispatch.bind(route)`，这是用来处理用户请求的核心方法，我们后面会讲。

再来看 `route[method]` ，这里就是我们传入的若干个中间件函数被处理的地方，注意，这里的 this 是我们 new 的 Route 对象（对应 home 路径）：

```javascript
Route.prototype[method] = function () {
  var handles = flatten(slice.call(arguments));

  for (var i = 0; i < handles.length; i++) {
    var handle = handles[i];

    if (typeof handle !== 'function') {
      var type = toString.call(handle);
      var msg = 'Route.' + method + '() requires a callback function but got a ' + type
      throw new Error(msg);
    }

    debug('%s %o', method, this.path)

    var layer = Layer('/', {}, handle);
    layer.method = method;

    this.methods[method] = true;
    this.stack.push(layer);
  }

  return this;
};
```

首先依然是我们熟悉的中间件函数扁平化，然后遍历结果数组，对每一个中间件函数，执行 Layer 函数，值得注意的是，我们之前的 Layer 都是通过 new 操作符来创建的，这里有些不同。实际上 Layer 函数会根据 this
来判断是否需要 new Layer 对象：

```javascript
function Layer(path, options, fn) {
  if (!(this instanceof Layer)) {
    return new Layer(path, options, fn);
  }

  debug('new %o', path)
  var opts = options || {};

  this.handle = fn;
  this.name = fn.name || '<anonymous>';
  this.params = undefined;
  this.path = undefined;
  this.regexp = pathRegexp(path, this.keys = [], opts);

  // set fast path flags
  this.regexp.fast_star = path === '*'
  this.regexp.fast_slash = path === '/' && opts.end === false
}
```

可以看出，如果 this 不是 Layer 的实例，那我们会 new 一个 Layer。否则会对 this 执行一些初始化操作。

也就是说，执行 `new Layer()` 时会**递归调用**这个函数，但是在 new 之后的 this 已经变成了 Layer 的实例了，也就顺理成章地去处理下面一些初始化代码。

接下来两行代码很好理解，一个是标记当前的请求类型，一个是标记可选的请求类型。

最后，将这个 layer 压入栈中，注意，这里的 this 是 对应 home 路径的 Route 对象，和我们前面提到的全局 router 栈不一样！

至此，`app[method]` 执行完成，总结一下， 执行 `app[method](path, fns)` 会为路径 path 新建一个与之对应的 Route 对象，这个 Route 也维护了一个栈，栈里面是用 Layer
对象包装的一个个中间件函数。

### PART 1 总结

上面的内容都围绕着一个内容展开： **中间件函数是如何被初始化**的？

一句话概括：我们通过调用 `app.use` 方法或者 `app[method]` 方法，为我们传入的路径初始化一个 Router 对象，这个对象维护了一个**栈**，相应的中间件函数通过 Layer
对象包装，然后被压入栈中，对于子路由，它会通过中间件函数 `route.dispatch`（后面会说）和全局路由建立关系。

我们通过调试工具验证一下上述结果：

![](http://cdn.yuzzl.top/blog/20210102111810.png)

下面我们重点讲述中间件如何被执行。

### 中间件的执行

我们以上图的代码为例，使用接口调试工具发起 get 请求，访问 **localhost:8000/home**，发起请求之后控制台输出如下：

```
middleware 01 in app.use
middleware 02 in app.use
home and get method middleware 01
home and get method middleware 02
home and get method middleware 03
```

为什么是这样的输出顺序？这些中间件是如何被回调的？我们从 `app.listen()` 开始详细分析整个过程。

#### app.listen()

代码如下：

```javascript
app.listen = function listen() {
  var server = http.createServer(this);
  return server.listen.apply(server, arguments);
};
```

app.listen() 实际上是执行 node.js 内部的 http 模块的 API `http.createServer(this)` 来创建一个服务器，然后调用 `server.listen()` 来监听端口。

每当有 HTTP 请求到达服务器时，createServer 中传入的函数就被自动执行，在这里传入的回调函数是 app，这个函数我们在 `createApplication()` 中提到过：

```javascript
var app = function (req, res, next) {
  app.handle(req, res, next);
};
```

所以用户发起请求之后，express 内部会去执行 `app.handle()`：

```javascript
app.handle = function handle(req, res, callback) {
  var router = this._router;

  // final handler
  var done = callback || finalhandler(req, res, {
    env: this.get('env'),
    onerror: logerror.bind(this)
  });

  // no routes
  if (!router) {
    debug('no routes defined on app');
    done();
    return;
  }

  router.handle(req, res, done);
};
```

不难看出 `app.handle()` 实质是执行 `app._router.handle()` 。

#### router.handle()

`router.handle()` 的代码很长，下面的代码我做了精简，但足以表达中间件调用的核心流程，结合注释理解：

```javascript
proto.handle = function handle(req, res, out) {
  var self = this;

  // 将 next 函数绑定到 req 对象下
  req.next = next;

  // 执行一次 next 函数
  next();

  function next(err) {

    var idx = 0;

    var layer;  // 匹配到的层
    var match;  // 是否匹配成功
    var route;  // 该层是路由层，它会从 undefined 变成相应的路由对象

    // 这个循环遍历 stack 数组，匹配对应的层，一旦匹配成功就会跳出循环
    while (match !== true && idx < stack.length) {
      // 当前层
      layer = stack[idx++];

      // 执行路由匹配
      match = matchLayer(layer, path);

      // layer.route，如果该层对应的是路由中间件，那么这个 route 是有值的，它就是相应的 Route 对象。
      route = layer.route;

      // 如果没有匹配到，再循环
      if (match !== true) {
        continue;
      }

      // 没有 route 对象，会被忽略
      if (!route) {
        continue;
      }
    }

    if (match !== true) {
      return done(layerError);
    }

    // 保存 route 对象
    if (route) {
      req.route = route;
    }

    // self.process_params 会调用回调函数，
    self.process_params(layer, paramcalled, req, res, function (err) {

      // 如果当前层是路由层
      if (route) {
        return layer.handle_request(req, res, next);
      }

      // 一般的中间件层，这个方法的主要内容是 url 路径的处理
      // 最后会调用 layer.handle_request(req, res, next) 来处理请求
      trim_prefix(layer, layerError, layerPath, path);
    });
  }
};
```

上面的代码我们可以分为两部分，第一部分是层匹配，第二部分是层执行。

层匹配即根据**当前路径**匹配对应的层，如果当前路径是 `/home`，那么全局路由的每一层、`/home` 路由的每一层都会匹配成功。

层执行指的是对于匹配到的层，我们会通过 `layer.handle_request()` 执行其中的 `handler` 函数。

对于普通层，执行的是我们注册的中间件。

对于路由层，执行的是 `Route.prototype.dispatch`。（它本质上也是一个中间件）。

从上面的代码我们可以看出来普通层多了一步 `trim_prefix()`，它主要是对路径进行了处理，但最终还是会去调用 `layer.handle_request()`。

在 `layer.handle_request()` 中，中间件函数在一个 `try..catch` 块中被执行。

```javascript
Layer.prototype.handle_request = function handle(req, res, next) {
  var fn = this.handle;

  if (fn.length > 3) {
    // not a standard request handler
    return next();
  }

  try {
    fn(req, res, next);
  } catch (err) {
    next(err);
  }
};
```

当我们的中间件函数继续调用 next 时，我们就会去栈中寻找上一层，然后以同样的方法执行它。

#### Route.prototype.dispatch()

对于非全局路由，我们也会执行一个中间件，这个中间件在路由注册的时候就被导入，下面的代码做了一些精简，删去了一些边界错误处理：

```javascript
Route.prototype.dispatch = function dispatch(req, res, done) {
  var idx = 0;
  var stack = this.stack;

  req.route = this;

  next();

  function next(err) {
    var layer = stack[idx++];
    if (!layer) {
      return done(err);
    }

    if (layer.method && layer.method !== method) {
      return next(err);
    }

    layer.handle_request(req, res, next);
  }
};
```

不难看出，这部分逻辑和前面的 `proto.handle()` 极为相似。

前面我们说过，每个路由（Route）对象也会维护一个栈，存储自身匹配的中间件。并且他们会通过这个中间件函数和全局路由进行关联。

在上面的代码中，我们首先执行了 next 函数，它会获取当前路由栈的第一层，通过 `handle_request()` 执行之，如果用户在回调函数中执行 next 函数，那么又会重复上述操作，直到栈完全遍历位置。

### PART 2 总结

在这一部分里面，我们讨论了 express 框架中间件的执行流程，首先在全局路由中找到第一个符合的层，然后将执行下一个匹配层的 next 作为回调函数的参数传给中间件，在中间件内部调用 next() 函数就可以实现中间件逐层调用的效果。

在最后，我们解决一下这部分开头的输出问题：

```javascript
const express = require("express");

const app = express();

app.use(/* 中间件 M1 */ (req, res, next) => {
  console.log("middleware 01 in app.use");
  next();
}, /* 中间件 M2 */ (req, res, next) => {
  console.log("middleware 02 in app.use");
  next();
});

app.get('/home', /* 中间件 M3 */ (req, res, next) => {
  console.log("home and get method middleware 01");
  next();
}, /* 中间件 M4 */ (req, res, next) => {
  console.log("home and get method middleware 02");
  next();
}, /* 中间件 M5 */ (req, res, next) => {
  console.log("home and get method middleware 03");
  res.end("hello world");
});


app.listen(8000, () => {
  console.log("your project is running successfully!");
});
```

根据第一部分的知识，上面的代码将会构造如下的数据结构：

![](http://cdn.yuzzl.top/blog/20210102152616.png)

:::tip 注意

stack 中的每一层都是通过 **Layer** 对象来封装的，layer 对象中的 handle 成员变量才是真正的中间件函数。
:::

一旦有请求进来，那么会如此调用：

![](http://cdn.yuzzl.top/blog/20210102153824.png)

再看下面的代码，结合上述内容，如果访问 `home` 接口，会输出什么？

```javascript
const express = require("express");

const app = express();

app.use((req, res, next) => {
  console.log("middleware 01 in app.use");
  next();
  console.log("after m1 next");
}, (req, res, next) => {
  console.log("middleware 02 in app.use");
  next();
  console.log("after m2 next");
});

app.get('/home', (req, res, next) => {
  console.log("home and get method middleware 01");
  next();
  console.log("after m3 next");
}, (req, res, next) => {
  console.log("home and get method middleware 02");
  next();
  console.log("after m4 next");
}, (req, res, next) => {
  console.log("home and get method middleware 03");
  res.end("hello world");
});
app.listen(8000, () => {
  console.log("your project is running successfully!");
});
```

输出结果如下，具体的分析过程不再赘述：

```
your project is running successfully!
middleware 01 in app.use
middleware 02 in app.use
home and get method middleware 01
home and get method middleware 02
home and get method middleware 03
after m4 next
after m3 next
after m2 next
after m1 next
```

## Koa

相比 express，**koa** 是一个**更加轻量级的框架**。express 和 Koa 的核心都是**中间件**，但是他们的执行机制略有不同。

### 中间件的注册与执行

下面的代码启动了一个 koa 服务器：

```javascript
const Koa = require("koa");

const app = new Koa();


app.use((ctx, next) => {
  console.log("middleware in app.use");
  next();
});

app.listen(8000, () => {
  console.log("success!");
});
```

和 express 不同，这里 new 的 Koa 是一个类，所有的核心方法都包含在这里面，我们先看它的构造函数的实现：

```javascript
module.exports = class Application extends Emitter {
  constructor(options) {
    super();
    options = options || {};
    this.proxy = options.proxy || false;
    this.subdomainOffset = options.subdomainOffset || 2;
    this.proxyIpHeader = options.proxyIpHeader || 'X-Forwarded-For';
    this.maxIpsCount = options.maxIpsCount || 0;
    this.env = options.env || process.env.NODE_ENV || 'development';
    if (options.keys) this.keys = options.keys;

    this.middleware = [];
    this.context = Object.create(context);
    this.request = Object.create(request);
    this.response = Object.create(response);
    if (util.inspect.custom) {
      this[util.inspect.custom] = this.inspect;
    }
  }
};
```

大部分都是一些参数的初始化，例如环境变量、代理配置，从 `this.middleware = []` 开始，我们看到了一些熟悉的内容：

- 中间件 `middleware`（可得知所有的中间件最终会被存放到这个数组中）
- context、request、response 对象，其中 context 是我们中间件的第一个参数。

现在我们还不清楚它们在何时会被用上。在实例化 Koa 对象之后，我们执行了 `app.use()`，来看它的源码：

```javascript
module.exports = class Application extends Emitter {
  use(fn) {
    if (typeof fn !== 'function') throw new TypeError('middleware must be a function!');
    if (isGeneratorFunction(fn)) {
      deprecate('Support for generators will be removed in v3. ' +
        'See the documentation for examples of how to convert old middleware ' +
        'https://github.com/koajs/koa/blob/master/docs/migration.md');
      fn = convert(fn);
    }
    debug('use %s', fn._name || fn.name || '-');
    this.middleware.push(fn);
    return this;
  }
};
```

use 的代码非常简单，其最终就是把你传入的中间件 push 到前面提到的 `middleware` 数组。

相比 express 对中间件的初始化方式（用 Layer 封装、特殊的路由中间件），koa 的处理更为简单粗暴。

服务器的启动依靠 `listen()` 方法：

```javascript
module.exports = class Application extends Emitter {
  listen(...args) {
    debug('listen');
    const server = http.createServer(this.callback());
    return server.listen(...args);
  }
};
```

和 express 如出一辙，都是调用了 http 库的 `createServer()`，并传入相应的回调函数 -- 这个回调函数会在用户发送请求时执行。

值得注意的是，这里的回调函数是 `this.callback()` 的**返回值**，也就是下面的 `handleRequest()`：

```javascript
module.exports = class Application extends Emitter {
  callback() {
    const fn = compose(this.middleware);

    if (!this.listenerCount('error')) this.on('error', this.onerror);

    const handleRequest = (req, res) => {
      const ctx = this.createContext(req, res);
      return this.handleRequest(ctx, fn);
    };

    return handleRequest;
  }
};
```

用户发送请求，`handleRequest()` 被执行，首先调用 `createContext()` 初始化上下文对象（context），也就是中间件函数的第一个参数，例如把 http 模块的 res、req 对象绑定到 context
对象上。

最终执行核心方法 `this.handleRequest()`：

```javascript
module.exports = class Application extends Emitter {
  handleRequest(ctx, fnMiddleware) {
    const res = ctx.res;
    res.statusCode = 404;
    const onerror = err => ctx.onerror(err);
    const handleResponse = () => respond(ctx);
    onFinished(res, onerror);
    return fnMiddleware(ctx).then(handleResponse).catch(onerror);
  }
};
```

第一个参数是 context，第二个参数是 `fnMiddleware`，在上面提到的 `callback()` 函数中可以看出，它是在 `callback()` 执行时，通过对 `this.middleware`
执行 `compose()` 得到的。

所以关键就是这里的 `compose()` 方法了，它来自单独的一个库，叫做 `koa-compose`：

- 这个函数要求传入 middleware 数组。
- 首先是数组的判断、以及每个成员是不是函数的判断。
- 然后返回一个函数，这个会在上面 `handleRequest()` 中被执行。
- 这个函数又返回一个函数 `dispatch(0)`，不难看出这里的 0 表示下标。
- dispatch 函数会通过 `let fn = middleware[i]` 得到某个中间件。
- 接着调用 `fn(context, dispatch.bind(null, i + 1))`，fn 是中间件函数，context 是上下文，`dispatch.bind(null, i + 1))` 就是 第二个参数 next 了。
- 很明显，这是一个递归调用，它会一直去调用每一个中间件，直到遍历并执行完所有的中间件，退出递归。

```javascript
function compose(middleware) {
  if (!Array.isArray(middleware)) throw new TypeError('Middleware stack must be an array!')
  for (const fn of middleware) {
    if (typeof fn !== 'function') throw new TypeError('Middleware must be composed of functions!')
  }

  return function (context, next) {
    let index = -1
    return dispatch(0)

    function dispatch(i) {
      if (i <= index) return Promise.reject(new Error('next() called multiple times'))
      index = i
      let fn = middleware[i]
      if (i === middleware.length) fn = next
      if (!fn) return Promise.resolve()
      try {
        return Promise.resolve(fn(context, dispatch.bind(null, i + 1)));
      } catch (err) {
        return Promise.reject(err)
      }
    }
  }
}
```

可以看出，Koa 执行中间件的流程也非常简单，请看下面的代码，试推测出它的输出：

```javascript
const Koa = require("koa");

const app = new Koa();

app.use((ctx, next) => {
  console.log("middleware 01 in app.use");
  next();
  console.log("middleware 01 in app.use after next");
});

app.use((ctx, next) => {
  console.log("middleware 02 in app.use");
  next();
  console.log("middleware 02 in app.use after next");
});

app.use((ctx, next) => {
  console.log("middleware 03 in app.use");
  ctx.response.body = "hi~";
});

app.listen(8000, () => {
  console.log("success!");
});
```

```
success!
middleware 01 in app.use
middleware 02 in app.use
middleware 03 in app.use
middleware 02 in app.use after next
middleware 01 in app.use after next
```

### PART 3 总结

Koa 作为一个轻量级框架，其底层逻辑也非常的清晰易懂：

对于中间件的注册，只是将中间件函数放入 Koa 类的 middleware 数组中，并没有像 express 那样用层封装、进行路由的区分。

对于中间件的执行，和 express 有异曲同工之妙，只不过每次请求初始化中间件时，它是将中间件数组的每个中间件 **compose** 了（可以理解为**组合**），组合的方式是通过递归 --
将触发下一个中间件的函数用 `dispatch.bind()` 封装，作为上一个中间件函数的第二个参数。

## express 和 Koa 对比

express 和 Koa 的共同之处在于核心都是**中间件**，那么又有什么区别？各有什么优势？下面我们来探究一下。

### Koa 更加轻量级

从上面的源码分析中不难看出，express 是一个比较全面的 web 框架，内置了参数解析、路由匹配等功能。

而 Koa 则是一个**轻量级的框架**，短小精悍，所有的额外功能都要通过第三方的库进行扩展。

他们类似于 Python Web 开发中的 Django 和 flask。

### 针对异步代码

express 框架在处理某些异步操作时略有些捉襟见肘，来看下面的代码，这两份代码都使用了类似的异步中间件：

**express**

```javascript
const express = require("express");

const app = express();

const myPromise = () => new Promise((resolve) => {
  setTimeout(() => {
    resolve("promise resolved!");
  }, 2000);
});


app.use(async (req, res, next) => {
  console.log("middleware 01");
  await next();
  console.log("after middleware 01 next");
  res.end("hello~");
});


app.use(async (req, res, next) => {
  const timeRes = await myPromise();
  console.log(timeRes);
});


app.listen(8000, () => {
  console.log("listening!");
})
```

**koa**

```javascript
const Koa = require("koa");

const app = new Koa();

const myPromise = () => new Promise((resolve) => {
  setTimeout(() => {
    resolve("promise resolved!");
  }, 2000);
});


app.use(async (ctx, next) => {
  console.log("middleware 01");
  await next();
  console.log("after middleware 01 next");
  ctx.body = "hello~";
});


app.use(async (ctx, next) => {
  const timeRes = await myPromise();
  console.log(timeRes);
});


app.listen(8000, () => {
  console.log("listening!");
})
```

在 express 的代码中，我们得到输出：

```
middleware 01
after middleware 01 next
promise resolved!
```

在 Koa 的代码中，我们得到输出，并且响应会有约两秒的延迟：

```
middleware 01
promise resolved!
after middleware 01 next
```

我们想达成这样一个目的 -- 在第一个中间件中利用 **await** 来等待下一个异步中间件函数（它使用 await 执行了一个 `setTimeout()` 并打印结果）执行完成，但是只有 Koa 的版本能实现需求。

为什么？我们先得知道 await 关键词的特性 -- await 关键字期待（但实际上并不要求）一个**实现 thenable 接口**的对象，但常规的值也可以。如果是实现 thenable 接口的对象，则这个对象可以由 await
来“解包”。如果不是，则这个值就被当作已经 **resolved 的 Promise**。

那么问题就成了 express 中间件参数的 next 是一个异步函数吗？答案为不是异步函数。你可能会问，我不是给 await 后面的 next 加了 async 了吗？实际上，express 对原本的 next
还做了一层封装，此部分的代码前面已经讲了：

```javascript
Layer.prototype.handle_request = function handle(req, res, next) {
  var fn = this.handle;
  if (fn.length > 3) {
    return next();
  }
  try {
    fn(req, res, next);
  } catch (err) {
    next(err);
  }
};
```

上面 `try` 块中包裹的 `fn` 就是我们真正的中间件函数 -- 但是我们 await 后面跟着的 next 并不是它。

而对于 koa 的实现（只保留主干部分），其 next 函数如下:

```javascript
return function (context, next) {
  function dispatch(i) {
    let fn = middleware[i]
    return Promise.resolve(fn(context, dispatch.bind(null, i + 1)));
  }
}
```

fn 是我们的中间件函数，它执行的结果是一个 promise，而 `Promise.resolve()` 是幂等的，next() 的返回值本质上就是我们的中间件函数，这就解释了为什么 `await next()` 是有效的。

## 参考资料

expressjs，[express 代码仓库](https://github.com/expressjs/express)

koa，[koa 代码仓库](https://github.com/koajs/koa)