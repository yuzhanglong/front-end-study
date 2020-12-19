# 深入浏览器和 Node.js 的事件循环

[[toc]]

如何理解事件循环？

[HTML Standard](https://html.spec.whatwg.org/multipage/webappapis.html#event-loops) 如此介绍道：

To coordinate events, user interaction, scripts, rendering, networking, and so forth, user agents must use event loops
as described in this section. Each agent has an associated event loop, which is unique to that agent.


> 事件循环是 Node.js 处理非阻塞 I/O 操作的机制——尽管 JavaScript 是单线程处理的 —— 当有可能的时候，它们会把操作转移到系统内核中去。

[Node.js 官网](https://nodejs.org/en/docs/guides/event-loop-timers-and-nexttick) 如此介绍道：

The event loop is what allows Node.js to perform non-blocking I/O operations — despite the fact that JavaScript is
single-threaded — by offloading operations to the system kernel whenever possible.

> 为了协调事件、用户交互、脚本、渲染、网络等，用户代理（如浏览器）必须使用事件循环。 每个代理有一个关联的事件循环，它是唯一的。

对于 Node.js，维基百科 这样描述 I/O：I/O 通常指数据在存储器（内部和外部）或其他周边设备之间的输入和输出，是信息处理系统（例如计算机）与外部世界（可能是人类或另一信息处理系统）之间的通信。 我们 node
开发环境中最常见的有**文件读写**、**网络请求**操作。在 node 环境下，事件循环就是我们和 **操作系统非阻塞调用**沟通的桥梁。

对于浏览器，用户交互（如浏览器鼠标事件）、网络（ajax 请求）是浏览器内部提供的 API （当然再往底层走也是操作系统）。事件循环就是我们的 JavaScript 和**浏览器 API** 进行沟通的一座桥梁。

## 浏览器的事件循环

介绍浏览器的事件循环之前，我们必须理解一些概念：

js 是单线程的：JavaScript的代码执行是在一个单独的线程中的，单线程运行时，它具有一个调用堆栈。程序一次可以运行一段代码。如果一些事是非常耗时的（例如 `setTimeout()`），就意味着当前的线程就会被阻塞。

回调队列（Callback Queue）：当满足条件时，回调函数会被送到一个**回调队列**中，这个队列里面的代码会在适当的时候被运行。

浏览器接口（Web API）：浏览器提供给用户的 API。

### 一个简单的案例

来看下面代码：

```javascript
console.log("Hi!");

setTimeout(function timeout() {
  console.log("hello world!");
}, 2000);

console.log("main end");
```

如果没有事件循环，那么执行 `setTimeout` 会被阻塞，到 2s 之后才执行，这会大大降低程序运行的效率。事件循环机制就是解决这个问题的关键。

实际运行时，是这样实现的：

执行 console.log("Hi!")，调用栈如图，执行完成之后，它会出栈：

![](http://cdn.yuzzl.top/blog/20201219142803.png)

执行 `setTimeout()`，我们会触发 Web API，它会单独进行系统调用（在这里是计时器）。

![](http://cdn.yuzzl.top/blog/20201219142939.png)

![](http://cdn.yuzzl.top/blog/20201219143005.png)

在 web API 调用的同时（注意是浏览器内部执行，不是 JavaScript 主线程执行，它不会阻塞 JavaScript 主线程），我们接着执行 `console.log("main end")` ，注意此时 web API
的计时器也在同步地执行，执行完成，出栈。

![](http://cdn.yuzzl.top/blog/20201219143125.png)

此时主函数的代码执行完毕。另外，一旦计时器执行完成，web API 会将回调函数放入回调队列中。

![](http://cdn.yuzzl.top/blog/20201219143358.png)

主线程发现回调队列有内容，会从队列中取出它，放到调用栈中执行：

![](http://cdn.yuzzl.top/blog/20201219143500.png)

您可以进入[这个网站](http://latentflip.com/loupe/?code=Y29uc29sZS5sb2coIkhpISIpOw0KDQpzZXRUaW1lb3V0KGZ1bmN0aW9uIHRpbWVvdXQoKSB7DQogIGNvbnNvbGUubG9nKCJoZWxsbyB3b3JsZCEiKTsNCn0sIDIwMDApOw0KDQpjb25zb2xlLmxvZygibWFpbiBlbmQiKTs%3D!!!PGJ1dHRvbj5DbGljayBtZSE8L2J1dHRvbj4%3D)
来体验一下上面的全过程。

### 宏任务和微任务

值得注意的是，上面提到的回调队列并不是单独的一个队列，而是两个队列：

- **宏任务队列**（macrotask queue）：**ajax**、**setTimeout**、**setInterval**、**DOM监听**、**UI Rendering**等
- **微任务队列**（microtask queue）：Promise的then回调、 Mutation Observer API、`queueMicrotask()` 等。

其优先级可以参考下图：

![](http://cdn.yuzzl.top/blog/event-loop.jpg)

我们注意到，事件循环期望微任务**尽可能快地被执行完成**，在上图中体现为每次执行完成一个宏任务，都会去查看微任务队列中有没有内容，如果有，则执行它们直至队列为空。

### 实践

来看下面的代码：

```javascript
console.log('start')

setTimeout(function () {
  console.log('setTimeout!')
}, 0)

Promise.resolve()
  .then(function () {
    console.log('promise1')
  })
  .then(function () {
    console.log('promise2')
  })

console.log('end')
```

分析一下过程：

- 全局代码压栈，打印start。
- `setTimeout()` 进入 **macrotask queue**。
- `Promise.then` 后的回调进入 **microtask queue**。
- 执行最后一行，打印 end。
- 全局代码执行完毕，接下来执行 **microtask** 的任务，打印 promise1、promise2。
- 这时 microtask 队列已经为空，从上面的流程图可知，接下来主线程会去做一些 UI 渲染工作（不一定会做），然后开始下一轮 event loop， 执行 `setTimeout()` 的回调，打印出 **setTimeout!**
  字符串。

接下来，我们介绍 node.js 的事件循环，其机制比浏览器复杂得多。

### Node.js 的事件循环
