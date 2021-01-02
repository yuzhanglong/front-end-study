# express & koa 框架对比及原理分析

本文将结合源码剖析 **node.js** 的两款优秀框架 **express** 和 **koa** 的原理。本文假设读者已对这两款框架有所了解，并会简单使用。

## express

### 从一个案例讲起

来看下面的 DEMO，它可以启动一个 express 服务器：

```javascript
const express = require("express");

const app = express();

app.use((req, res, next) => {
  console.log("middleware 01 in app.use");
  next();
}, (req, res, next) => {
  console.log("middleware 02 in app.use");
  next();
});

app.get('/home', (req, res, next) => {
  console.log("home and get method middleware 01");
  next();
}, (req, res, next) => {
  console.log("home and get method middleware 02");
  next();
}, (req, res, next) => {
  console.log("home and get method middleware 03");
  res.end("hello world");
});


app.listen(8000, () => {
  console.log("your project is running successfully!");
});
```

其中，函数体 `(req, res, next) => {}` 被称为中间件函数（下文所有提到的中间件函数均指这种形式的函数体），中间件函数能够访问请求对象 (req)、响应对象 (res)
以及应用程序的请求/响应循环中的下一个中间件函数。下一个中间件函数通常由名为 next 的变量来表示，通过调用函数 `next()` 可以将控制权转移到下一个中间件函数中。

使用 postMan 访问 **localhost:8000/home**，发起请求之后控制台输出如下：

```
middleware 01 in app.use
middleware 02 in app.use
home and get method middleware 01
home and get method middleware 02
home and get method middleware 03
```

接下来我们详细分析如上输出的原因。

### require("express")

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

### app.use()

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

### this.lazyrouter()

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

也就是说，中间件会被注册到**相对应的路由（Router 对象）**中。在上面的代码中就是全局路由，相应的路径为 `/`。接下来我们分析 `router.use(path, fn)`。

### router.use(path, fn)

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

### app[method] 方法

app[method] 代码如下：

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

- 它以我们设置的路径为参数， new 了一个 Router 对象。
- 初始化了一个 Layer，之后将这个 Layer 压入栈中，注意，这里的 `this` 为 app._router，也就是全局 router 对象。

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

如果对前面的代码还有印象的话，在 new Layer() 时，我们传入的第二个参数是我们的中间件函数，在这里是 `route.dispatch.bind(route)`，这是用来处理用户请求的，我们后面会讲。

再来看 `route[method]` ，这里就是我们传入的若干个中间件函数被处理的地方，注意，这里的 this 是我们 new 的 Router 对象（对应 home 路径）：

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

也就是说，执行 new Layer() 时会**递归调用**这个函数，但是在 new 之后的 this 已经变成了 Layer 的实例了，也就顺理成章地去处理下面一些初始化代码。

接下来两行代码很好理解，一个是标记当前的请求类型，一个是标记可选的请求类型。

最后，将这个 layer 压入栈中，注意，这里的 this 是 对应 home 路径的 router 对象，和我们前面提到的全局 router 栈不一样！

至此，app[method] 执行完成，总结一下， 执行 app[method](path, fns) 会为路径 path 新建一个与之对应的 Router 对象，这个 Router 也维护了一个栈，栈里面是用 Layer
对象包装的一个个中间件函数。

### 总结 PART 1

上面的内容都围绕着一个内容展开： **中间件函数是如何被初始化**的？

一句话概括：我们通过调用 `app.use` 方法或者 `app[method]` 方法，为我们传入的路径初始化一个 Router 对象，这个对象维护了一个**栈**，相应的中间件函数通过 Layer
对象包装，然后被压入栈中，对于子路由，它会通过中间件函数 `route.dispatch`（后面会说）和全局路由建立关系。

我们通过调试工具验证一下上述结果：

![](http://cdn.yuzzl.top/blog/20210102111810.png)

下面我们重点讲述中间件如何被执行。





