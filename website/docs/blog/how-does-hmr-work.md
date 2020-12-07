# webpack热更新(HMR)工作原理

## 总述

开发环境下的热更新是 webpack 的一个特色功能，其大大提高了开发者的工作效率 -- 我们修改代码的同时浏览器就可以执行更新操作，且会**保留当前状态**。本文将讲解 webpack 的热更新原理。

:::tip
- 建议读者尽量关注热更新的流程，并辅以源码加以理解。下面对于源码的分析只会列出**主干部分**的内容，具体细节及边界处理感兴趣可自行查阅。

- 另外，webpack 的源码随着版本的更新**改动比较大**，文末参考资料的第一篇文章是去年十二月份写的，和现在（2020-12）对比有很多代码都发生了巨大的变化，再早一点的教程也是变化很大。但是总体的热更新流程是万变不离其宗的。
:::


本文的 webpack 配置如下所示：

**webpack.config.js**

```javascript
const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require("path");

module.exports = {
  entry: {
    app: "./src/index.js",
  },
  output: {
    filename: '[name].bundle.js',
    path: path.resolve(__dirname, 'dist')
  },
  plugins: [
    new HtmlWebpackPlugin({
      title: 'Hot Module Replacement'
    })
  ],
  devtool: 'source-map',
  devServer: {
    hot: true
  }
}
```

**index.js**
```javascript
import printMe from './print.js';

function component() {
  const element = document.createElement('div');
  const btn = document.createElement('button');

  element.innerHTML = "hello world!";

  btn.innerHTML = 'Click me and check the console!';
  btn.onclick = printMe;

  element.appendChild(btn);

  return element;
}

let element = component(); // 当 print.js 改变导致页面重新渲染时，重新获取渲染的元素
document.body.appendChild(element);

if (module.hot) {
  module.hot.accept('./print.js', function () {
    console.log('Accepting the updated printMe module!');
    document.body.removeChild(element);
    element = component(); // 重新渲染页面后，component 更新 click 事件处理
    document.body.appendChild(element);
  });
}
```

**print.js**
```javascript
export default function printMe() {
  console.log('hello world');
}
```



## 直观感受

当我们修改 `print.js` 的内容时，我们能够看到的是控制台打印的内容更改了，说明热替换一切正常，这很明显。但是我们还可以看看 调试工具 network 选项卡的一些信息，在这里我们可以推测出一个大致的流程。

让我们启动项目，页面初次刷新，我们得到了 `app.bundle.js` 的入口js文件，值得注意的是，浏览器还和开发服务器保持了一个 **websocket** 连接，根据传输的信息我们可以肯定这和热更新密切相关。

![](http://cdn.yuzzl.top/blog/20201206212847.png)

现在我们修改 print.js 的内容，然后等待热更新加载。

再次抓包查看，发现更新了三部分内容：

- 一个json文件

![](http://cdn.yuzzl.top/blog/20201206213214.png)

- 一个js文件

从这个 js 里面我们可以找到我们修改的内容，可以猜出这个文件里面的内容将把旧代码替换。

同时，观察代码发现，返回的内容是一个函数，可知这个js文件可以在适当地位置被执行, 这种通过函数通信的方式也称为 **JSONP**。

![](http://cdn.yuzzl.top/blog/20201206213232.png)

- websocket 连接内容的变化

我们可以看到 websocket 的信息也添加了一些内容，而且第一次生成的 hash 值刚好是新请求到的 js 文件的 hash 值。新生成的 hash 值应该是下一次热更新的文件。

![](http://cdn.yuzzl.top/blog/20201206213907.png)


我们不难得出这样的一个大致的流程：

- 热更新通过浏览器和 webpack 开发服务器的 websocket 实现通信。
- 当我们修改文件时，webpack 开发服务器会通过 websocket 通知浏览器需要更新。
- 浏览器知晓需要更新时，利用之前的 hash 值，通过 ajax 请求获取新的 js 文件，然后执行一系列业务逻辑，让新的代码覆盖旧的代码。

接下来我们结合源码，深入分析整个流程。


## 本地代码监听与编译

我们不难想到，开发环境下一定有一个监听模块，用来监听本地文件的更新情况。这个功能由 `webpack-dev-middleware` 来实现，来看源码，只列出主干部分。

```javascript{5,18}
// webpack-dev-middleware/index.js
module.exports = function wdm(compiler, opts) {
  const context = createContext(compiler, options);
  // 开始监听
  context.watching = compiler.watch(options.watchOptions, (err) => {
   if (err) {
    context.log.error(err.stack || err);
    if (err.details) {
      context.log.error(err.details);
    }
   }
  });

  if (options.writeToDisk) {
    toDisk(context);
  }

  setFs(context, compiler);

  return Object.assign(middleware(context), {
    // 向外暴露了一些接口...
  });
};
```

其中，第五行 的 compiler 是 webpack 的 compiler 实例，它和 webpack 的编译工作密切相关。`watch` 可以通过比较**文件生成时间**的变化实现对本地文件的监听，文件发生变化则重新编译，编译完成之后继续监听。

那么如何知道什么时候编译完成就是重中之重了。


## 监听编译结束并通知

上面说过，`webpack-dev-middleware` 配置了 `watch` 方法，我们可以做到修改文件立即编译。那么什么时候知道编译已经完成？ 如果你写过 webpack plugin，那么一定会想到使用 生命周期 hook（钩子），`webpack-dev-server` 就是如此做的，server 初始化时会执行 `setupHooks()` 方法：

```javascript {13,14,15}
// node_modules/webpack-dev-server/lib/Server.js
setupHooks() {
    // Listening for events
    const invalidPlugin = () => {
      this.sockWrite(this.sockets, 'invalid');
    };

    const addHooks = (compiler) => {
      const { compile, invalid, done } = compiler.hooks;

      compile.tap('webpack-dev-server', invalidPlugin);
      invalid.tap('webpack-dev-server', invalidPlugin);
      done.tap('webpack-dev-server', (stats) => {
        this._sendStats(this.sockets, this.getStats(stats));
        this._stats = stats;
      });
    };

    if (this.compiler.compilers) {
      this.compiler.compilers.forEach(addHooks);
    } else {
      addHooks(this.compiler);
    }
  }
```
注意方法 `done.tap()`，首先对 webpack 的 compiler.hooks 对象解构，拿到 `done` 钩子，传入相应的回调函数。一旦编译完成，`done` 钩子会被执行，相应的回调函数就会被执行。

来看 `_sendStats()`，这个方法就是通知浏览器 -- 新的内容编译完成了，来取新的数据吧。

```javascript{13,22}
_sendStats(sockets, stats, force) {
  const shouldEmit =
    !force &&
    stats &&
    (!stats.errors || stats.errors.length === 0) &&
    stats.assets &&
    stats.assets.every((asset) => !asset.emitted);

  if (shouldEmit) {
    return this.sockWrite(sockets, 'still-ok');
  }

  this.sockWrite(sockets, 'hash', stats.hash);

  if (stats.errors.length > 0) {
    // 告知浏览器出现 errors 
    this.sockWrite(sockets, 'errors', stats.errors);
  } else if (stats.warnings.length > 0) {
    // 告知浏览器出现 warnings
    this.sockWrite(sockets, 'warnings', stats.warnings);
  } else {
    this.sockWrite(sockets, 'ok');
  }
}
```
通过 `sockWrite` 以 websocket 的形式告知浏览器，一般情况下是 `hash` 和 `ok`，这里的 hash 是 **下一次**文件更新的 hash 值。

## 浏览器准备更新

通过 **websocket** 通信，浏览器（客户端）收到了 webpack-dev-server 传来的通知。很明显接下来的代码全部都在**浏览器**里执行。说明这些业务代码都被 webpack 打包时一起输出到 `bundle.js` 中。

我们可以在 webpack-dev-server 的代码中找到给予客户端的代码，在 index.js 中我们可以找到一个 `onSocketMessage` 变量，它就是对 websocket 服务的客户端监听。下面的代码摘自此文件，只保留了 `hash` 和 `ok` 指令：

```javascript
// node_modules/webpack-dev-server/client/index.js
var onSocketMessage = {
  hash: function hash(_hash) {
    status.currentHash = _hash;
  },
  ok: function ok() {
    sendMessage('Ok');

    if (options.useWarningOverlay || options.useErrorOverlay) {
      overlay.clear();
    }

    if (options.initial) {
      return options.initial = false;
    } // eslint-disable-line no-return-assign


    reloadApp(options, status);
  },
};
```

`hash` 指令将重置 `currentHash` 变量，`ok` 指令将执行`reloadApp()`，来看这个方法：

```javascript
function reloadApp(_ref, _ref2) {
    // 热更新模式
  if (hot) {
    log.info('[WDS] App hot update...');

    var hotEmitter = require('webpack/hot/emitter');

    hotEmitter.emit('webpackHotUpdate', currentHash);

    if (typeof self !== 'undefined' && self.window) {
      // broadcast update to window
      self.postMessage("webpackHotUpdate".concat(currentHash), '*');
    }
  } 
  // 实时重载模式，主要逻辑是调用 当前window的 location.reload(); 即实行强制刷新
  // 这部分代码略去
  else if (liveReload) {
    // 实时重载模式业务逻辑
  }
}
```

收到 `ok` 指令之后，浏览器会发送一个 `webpackHotUpdate` 事件。注意这里没有直接执行更新的逻辑。接受这个事件的代码在 `webpack/hot/dev-server.js` 下，这部分代码也会通过 webpack 打包到 `bundle.js` 中：

```javascript
// node_modules/webpack/hot/dev-server.js
var check = function check() {
module.hot
    .check(true)
    .then(function (updatedModules) {
      // 至此热更新完成
      if (upToDate()) {
        log("info", "[HMR] App is up to date.");
      }
    })
    // 省略了错误处理部分
};

var hotEmitter = require("./emitter");

hotEmitter.on("webpackHotUpdate", function (currentHash) {
    lastHash = currentHash;
    if (!upToDate() && module.hot.status() === "idle") {
        log("info", "[HMR] Checking for updates on the server...");
        check();
    }
});
log("info", "[HMR] Waiting for update signal from WDS...");
```

在这里 **webpackHotUpdate** 被监听到，同时更新 hash 值。并执行`check()` 方法，`check()` 方法就是热更新的的核心部分了。正常完成 check，则一次热更新流程完成。


## 执行更新 - check()

### check() 的来源

首先要知道 `check()` 这个方法是怎么来的。它来自`module.hot`, 可见某一个脚本将 `hot` 方法挂载到 `module` 上了。这是通过 `HotModuleReplacementPlugin` 来实现的。
从浏览器的调试工具中我们可以看到相关的代码，这部分代码最终会被压缩、写入 `bundle.js` 中：

![](http://cdn.yuzzl.top/blog/20201206235811.png)


:::tip
在本文开头的 webpack 配置中，并没有导入 **HotModuleReplacementPlugin**，这是因为 webpack-dev-server 会判断是否导入这个 plugin，如果没有会自动帮助导入，我们从源码中也可以得知：
```javascript
// node_modules/webpack-dev-server/lib/utils/addEntries.js
if (options.hot || options.hotOnly) {
  config.plugins = config.plugins || [];
  if (!config.plugins.find((plugin) => plugin.constructor.name === 'HotModuleReplacementPlugin')) {
     config.plugins.push(new webpack.HotModuleReplacementPlugin());
  }
}
```
:::

HotModuleReplacementPlugin 初始化了热更新所必需的 runtime Module 例如 `hot` 对象、`jsonp` 函数的读取功能、ajax 获取脚本的请求功能。

来看 `module.hot.check()` 源码，它返回一个`promise`：
```javascript
function hotCheck(applyOnUpdate) {
    // ps.省略了一些细节内容和错误处理

    // 设置状态为 check
    setStatus("check");
    return __webpack_require__.hmrM()
    .then(function (update) {
		setStatus("prepare");

		var updatedModules = [];
		blockingPromises = [];
		currentUpdateApplyHandlers = [];

        // 利用 promise all 执行多个同步的网络请求，这里是请求js文件
		return Promise.all(
			Object.keys(__webpack_require__.hmrC).reduce(function (
				promises,
				key
			) {
				__webpack_require__.hmrC[key](
					update.c,
					update.r,
					update.m,
					promises,
					currentUpdateApplyHandlers,
					updatedModules
				);
				return promises;
			},
			[])
        )
        // 请求完成的 then 回调
        .then(function () {
			return waitForBlockingPromises(function () {
				if (applyOnUpdate) {
					return internalApply(applyOnUpdate);
				} else {
					setStatus("ready");
					return updatedModules;
				}
			});
		});
	});
}
```
### 请求资源清单

首先 check 会执行 `__webpack_require__.hmrM()`，这个函数其实就是向 `webpack-dev-server` 请求更新后的资源信息（即 manifest，一个 json 文件）。

利用浏览器调试工具，我们可以在 `jsonp chunk loading` 模块中可以看到源码，结合下面注释很好理解：

![](http://cdn.yuzzl.top/blog/20201207125230.png)

```javascript
__webpack_require__.hmrM = () => {
    // 使用 fetch API 执行请求，如果不兼容会报错
    if (typeof fetch === "undefined") throw new Error("No browser support: need fetch API");
    
    // 调用 fetch，通过 字符串拼接获取url(baseurl + hash 值 + ".hot-update.json")
	return fetch(__webpack_require__.p + __webpack_require__.hmrF()).then((response) => {
		if(response.status === 404) return; // 404 没有找到
		if(!response.ok) throw new Error("Failed to fetch update manifest " + response.statusText);
        // 返回 资源信息 json
		return response.json();
	});
};
```
资源请求完成之后，将状态置为 **prepare**，接下来会去请求相应的 js 文件。上面这个函数返回一个 promise，在接下来的 then 回调中，我们可以拿到资源的信息 json 文件。

### 请求新的 js 文件

拿到需要请求的资源信息之后，我们会去请求新的 js 文件。回顾上面的 `module.hot.check()` 的源码，接下来返回了一个 `promise.all` 方法，这个方法的核心是 `__webpack_require__.hmrC` 函数。来看看它的实现，这部分的源码还是在 `json chunk loading` 模块中：

```javascript
__webpack_require__.hmrC.jsonp = function (
  // 新的代码片段的编号
	chunkIds,
	removedChunks,
	removedModules,
	promises,
	applyHandlers,
	updatedModulesList
) {
  // 省略了一些细节代码
  // 遍历获得的 chunk id
	chunkIds.forEach(function (chunkId) {
		if (
			__webpack_require__.o(installedChunks, chunkId) &&
			installedChunks[chunkId] !== undefined
		) {
      // 请求 js 资源
			promises.push(loadUpdateChunk(chunkId, updatedModulesList));
			currentUpdateChunks[chunkId] = true;
		}
	});
};
```

上面的代码会执行 `loadUpdateChunk(chunkId, updatedModulesList)` 然后将其返回值放入 `promises` 数组中。这个函数就是用来执行请求 js 代码块的，它执行 `__webpack_require__.l()`：

```javascript
// 省略了一些错误处理回调代码
function loadUpdateChunk(chunkId) {
	return new Promise((resolve, reject) => {
    
    // 将 resolve 传入 waitingUpdateResolves 中
    waitingUpdateResolves[chunkId] = resolve;

    // 拼接更新 chunk 的 url
		var url = __webpack_require__.p + __webpack_require__.hu(chunkId);

    // 脚本读取完成，我们会走到这里
    var loadingEnded = (event) => {
			if(waitingUpdateResolves[chunkId]) {
				waitingUpdateResolves[chunkId] = undefined
				var errorType = event && (event.type === 'load' ? 'missing' : event.type);
				var realSrc = event && event.target && event.target.src;
				error.message = 'Loading hot update chunk ' + chunkId + ' failed.\n(' + errorType + ': ' + realSrc + ')';
				error.name = 'ChunkLoadError';
				error.type = errorType;
				error.request = realSrc;
				reject(error);
			}
		};
    // 传入 url 和 loadingEnded 回调
		__webpack_require__.l(url, loadingEnded);
	});
}
```
首先将 promise 的 `resolve` 传入 `waitingUpdateResolves` 数组中，用于后续处理。我们会在后面的内容中提到。

再来看 `__webpack_require__.l`，它用来向服务器请求 js 代码，它的流程很简单，本质上是通过向 dom 插入 `script` 标签达到请求资源的目的，这种方案被称为 jsonp：

```javascript
__webpack_require__.l = (url, done, key) => {
  // 只保留主干部分，省略边界处理的代码
	var script, needAttach;

	script = document.createElement('script');

	script.charset = 'utf-8';

	script.timeout = 120;

	script.setAttribute("data-webpack", dataWebpackPrefix + key);

	script.src = url;
	
	inProgress[url] = [done];

  // script 加载完成的回调函数
	var onScriptComplete = (prev, event) => {
		script.parentNode && script.parentNode.removeChild(script);
		doneFns && doneFns.forEach((fn) => fn(event));
		if(prev) return prev(event);
	}

	script.onload = onScriptComplete.bind(null, script.onload);
};
```

当脚本获取完成时候，我们会走到 `onScriptComplete()` 方法，这个方法会遍历 doneFns，这个方法就是我们传入的回调函数，也就是 `__webpack_require__.l()` 中的 `loadingEnded()`。

### 模块替换 (apply)

jsonp 获得的代码会在加载完成之后**立刻执行**。之后我们就可以进行模块替换（apply）了，来看我们拿到的 js 脚本长什么样：

```javascript
self.webpackHotUpdatehmr(143, {
    569: (e,t,c)=>{
        "use strict";
        function o() {
            console.log("hello world!")
        }
        c.r(t),
        c.d(t, {
            default: () => o
        })
    }
}, (function(e) {
    "use strict";
    e.h = ()=>"f0fc968f5b65dea37ac3"
}
));
```

加载完成之后会调用 `self.webpackHotUpdatehmr()`，我们可以从 `jsonp chunk loading` 模块中找到它：

```javascript
// 删除部分细节的代码
self["webpackHotUpdatehmr"] = (chunkId, moreModules, runtime) => {

	currentUpdate[moduleId] = moreModules[moduleId];


	if(waitingUpdateResolves[chunkId]) {
		waitingUpdateResolves[chunkId]();
		waitingUpdateResolves[chunkId] = undefined;
	}
};
```

这个函数首先将 `moreModules` 放入 `currentUpdate` 中，等待后续处理，然后从 `waitingUpdateResolves` 找到相应的 resolve 函数（我们上面提到过，在函数 `loadUpdateChunk(chunkId)` 中），resolve 函数 `loadUpdateChunk`返回的 promise，最终这个 promise 会被 `check()` 函数的 then 回调接受：

```javascript
return waitForBlockingPromises(function () {
  if (applyOnUpdate) {
    return internalApply(applyOnUpdate);
  } else {
    setStatus("ready");
    return updatedModules;
  }
});
```

接下来执行 `waitForBlockingPromises`，它是一个递归函数：

```javascript
function waitForBlockingPromises(fn) {
	if (blockingPromises.length === 0) return fn();
	var blocker = blockingPromises;
	blockingPromises = [];
	return Promise.all(blocker).then(function () {
		return waitForBlockingPromises(fn);
	});
}
```

如果 `blockingPromises` 为空，fn 会被执行，主要执行的是 `internalApply(applyOnUpdate)` 方法：

```javascript
// 只保留主干代码
function internalApply(options) {
	options = options || {};

	var results = currentUpdateApplyHandlers.map(function (handler) {
		return handler(options);
	});
	
  setStatus("apply");
  
  // Now in "dispose" phase
	setStatus("dispose");

	results.forEach(function (result) {
		if (result.dispose) result.dispose();
	});

	// Now in "apply" phase
	setStatus("apply");

	var outdatedModules = [];
	results.forEach(function (result) {
		if (result.apply) {
			var modules = result.apply(reportError);
			if (modules) {
				for (var i = 0; i < modules.length; i++) {
					outdatedModules.push(modules[i]);
				}
			}
		}
	});

	return Promise.resolve(outdatedModules);
}
```

这个方法分两次遍历 `result` 数组，分别执行每个元素的 `dispose` 方法和 `apply` 方法，前者用来移除旧模块，后者用来增添新的模块：

apply方法主要做了这些事情，具体实现还是比较复杂的，可自行参阅源码，这部分涉及到了 webpack 打包原理。这里只列出主干部分：

- 遍历新增的模块，并插入代码到一个 webpack 全局维护的对象中：

```javascript
for (var updateModuleId in appliedUpdate) {
  if (__webpack_require__.o(appliedUpdate, updateModuleId)) {
    __webpack_require__.m[updateModuleId] = appliedUpdate[updateModuleId];
  }
}
```

请看下图，可以看出全局的 `__webpack_require__.m` 维护了一个对象，通过编号可以找到对应的代码块，我们只要通过编号匹配然后替换即可：

![](http://cdn.yuzzl.top/blog/20201207174111.png)


- 接下来，通过 `__webpack_require__` 执行相应的代码块：

```javascript
// run new runtime modules
for (var i = 0; i < currentUpdateRuntime.length; i++) {
  currentUpdateRuntime[i](__webpack_require__);
}
```

## 流程总结

上述流程总结如下图：

![](http://cdn.yuzzl.top/blog/20201207175642.png)

## 参考资料

[掘金 -- 轻松理解webpack热更新原理](https://juejin.cn/post/6844904008432222215#heading-10)