---
date: 2020-12-25

tags:

- Node.js
- JavaScript
---

# 分析浏览器和 NodeJS 的事件循环

[[toc]]

## 总述

本文将带你一起分析浏览器和 NodeJS 的事件循环。

强烈看完本文后去阅读国外博主 Deepal Jayasekara 介绍 EventLoop
的[系列文章](https://blog.insiderattack.net/event-loop-and-the-big-picture-nodejs-event-loop-part-1-1cb67a182810)
，有些地方会让你感到醍醐灌顶。

## 事件循环

如何理解事件循环？

[HTML Standard](https://html.spec.whatwg.org/multipage/webappapis.html#event-loops) 如此介绍道：

To coordinate events, user interaction, scripts, rendering, networking, and so forth, user agents must use event loops
as described in this section. Each agent has an associated event loop, which is unique to that agent.

> 为了协调事件、用户交互、脚本、渲染、网络等，用户代理（如浏览器）必须使用事件循环。 每个代理有一个关联的事件循环，它是唯一的。


[NodeJS 官网](https://nodejs.org/en/docs/guides/event-loop-timers-and-nexttick) 如此介绍道：

The event loop is what allows NodeJS to perform non-blocking I/O operations — despite the fact that JavaScript is
single-threaded。

> 事件循环是 NodeJS 处理非阻塞 I/O 操作的机制 —— 尽管 JavaScript 是单线程处理的。


对于浏览器，用户交互（如浏览器鼠标事件）、网络（ajax 请求）是浏览器内部提供的 API （当然再往底层走也是面向操作系统）。

综上所述，事件循环是 JavaScript 引擎和浏览器接口/操作系统沟通的一座桥梁，是浏览器、NodeJS 实现异步逻辑的方法。

:::tip 

IO I/O 通常指数据在存储器（内部和外部）或其他周边设备之间的输入和输出，是信息处理系统（例如计算机）与外部世界（可能是人类或另一信息处理系统）之间的通信。 我们 node 开发环境中最常见的有**文件读写**、**网络请求**操作。(维基百科)
:::

## 浏览器的事件循环

### 概念

介绍浏览器的事件循环之前，我们必须理解一些概念：

**Task（任务）**：一个任务就是由执行诸如从头执行一段程序、执行一个事件回调或一个 **interval/timeout** 被触发之类的标准机制而被调度的任意 JavaScript 代码。这些都在任务队列（task
queue）上被调度。

**Task queues（任务队列）**：一个事件循环具有一个或多个任务队列。任务队列是任务的**集合**。

**Web API（浏览器接口）**：浏览器提供给用户的 API。

**Call Stack（调用栈）**：主函数的调用栈。

### 基本流程

来看下面代码：

```javascript
console.log("Hi!");


const foo = (name) => {
  return "hello " + name;
}

setTimeout(() => {
  console.log("setTimeout Finish");
}, 1000);

console.log(foo("yzl"));
```

如果没有事件循环，那么执行 `setTimeout()` 会被阻塞，到 2s 之后才执行，这会大大降低程序运行的效率。事件循环机制就是解决这个问题的关键。

实际运行时，是这样实现的：

首先，我们执行 `console.log("Hi!")`:

<a data-fancybox title="" href="http://cdn.yuzzl.top/blog/20201225193822.png">![](http://cdn.yuzzl.top/blog/20201225193822.png)</a>

然后是函数 `foo()` 的定义，啥也不执行。

接着执行 `setTimeout()` 函数：

首先，让 `setTimeout()` 函数入栈：

<a data-fancybox title="" href="http://cdn.yuzzl.top/blog/20201225194900.png">![](http://cdn.yuzzl.top/blog/20201225194900.png)</a>

`setTimeout()` 立即执行，他会调用浏览器的 **WebAPI**，然后立刻出栈（执行完成），此时浏览器底层会**单独地**进行相应的系统调用（如计时器）：

<a data-fancybox title="" href="http://cdn.yuzzl.top/blog/20201225194626.png">![](http://cdn.yuzzl.top/blog/20201225194626.png)</a>

我们接着执行 `console.log(foo("yzl"))` ，注意此时 Web API 的计时器也在**同步地执行**，具体的入栈出栈操作这里不再赘述。

此时主函数的代码执行完毕，主线程会一直去查看任务队列有没有任务，如果有，将它压如调用栈，执行之。

一旦计时器执行完成，**Web API** 会将回调函数放入回调队列中。主线程发现回调队列有内容，会从队列中取出它，放到调用栈中执行：

<a data-fancybox title="" href="http://cdn.yuzzl.top/blog/20201225195530.png">![](http://cdn.yuzzl.top/blog/20201225195530.png)</a>

您可以进入[这个网站](http://latentflip.com/loupe/?code=Y29uc29sZS5sb2coIkhpISIpOw0KDQpzZXRUaW1lb3V0KGZ1bmN0aW9uIHRpbWVvdXQoKSB7DQogIGNvbnNvbGUubG9nKCJoZWxsbyB3b3JsZCEiKTsNCn0sIDIwMDApOw0KDQpjb25zb2xlLmxvZygibWFpbiBlbmQiKTs%3D!!!PGJ1dHRvbj5DbGljayBtZSE8L2J1dHRvbj4%3D)
来可视化体验浏览器的事件循环过程。

### 宏任务和微任务

值得注意的是，上面提到的回调队列是有优先级的顺序的，这里需要了解一下两个名词：

- **宏任务队列**（macrotask queue）：**ajax**、**setTimeout**、**setInterval**、**DOM 监听**等。
- **微任务队列**（microtask queue）：Promise 的 then 回调、`queueMicrotask()` 等。

:::tip

在 HTML Standard 中并没有提到 **macrotask** 这一名词，但是在很多的文章中都有出现，出现这个名词应该是为了方便读者理解。
:::

其步骤总结如下图：

<a data-fancybox title="" href="http://cdn.yuzzl.top/blog/event-loop.jpg">![](http://cdn.yuzzl.top/blog/event-loop.jpg)</a>

我们可以发现，事件循环期望微任务**尽可能快地被执行完成**，在上图中体现为每次执行完成一个宏任务，都会去查看微任务队列中有没有内容，如果有，则执行它们直至队列为空。

:::tip

注意最后的**Update Rendering**（执行一些渲染操作），它既不属于宏任务也不属于微任务。

关于渲染操作的详细内容可参考 [HTML Standard](https://html.spec.whatwg.org/multipage/webappapis.html#event-loop-processing-model) 第十一条。
:::

### 实践

来看下面的代码：

```javascript
console.log(1);
setTimeout(() => {
  console.log(2);
  Promise.resolve().then(() => {
    console.log(3)
  });
});
new Promise((resolve, reject) => {
  console.log(4)
  resolve()
}).then(() => {
  console.log(5);
})
setTimeout(() => {
  console.log(6);
})
console.log(7);
```

分析一下过程：

- 代码按顺序执行，先打印 `1`。
- `setTimeout()` 进入宏任务队列。
- `Promise.then()` 后的回调进入微任务队列，promise 中 的内容会被立即执行，打印 `4`。
- 执行最后一行，打印 `7`。
- 代码按序执行完毕。
- 接下来执行微任务队列的任务，打印 `5`
- 微任务队列已经没有任务，现在执行宏任务队列的任务，第一个 setTimeout 的回调被执行，打印 `2`, 其中的 `promise` 被加入微任务队列。
- 执行微任务队列的任务，打印 `3`
- 执行剩下宏任务队列中的 `6`

最终结果为 `1 - 4 - 7 - 5 - 2 - 3 - 6`

接下来，我们介绍 NodeJS 的事件循环，其机制比浏览器复杂得多。

## NodeJS 的事件循环

NodeJS 的事件循环的核心是 **[libuv](https://zh.wikipedia.org/wiki/Libuv)** 库，它提供对基于事件循环的异步 I/O 的支持。

- 我们的 JavaScript 会被送到 **v8** 引擎进行处理。
- 代码中会调用 Node API，会交给 libuv 库处理。
- libuv 通过一个事件循环（可以理解为轮询）来查询结果，并将结果放到事件队列中，然后交给 v8 引擎。

### 流程

下图是事件循环的流程，一次事件循环又被称为一次 **Tick**，**每个阶段都有一个队列来执行回调**。不同类型的事件在它们自己的队列中排队:

- **Expired Timers And Intervals Queue**：本阶段执行已经被 `setTimeout()` 和 `setInterval()` 的调度回调函数。
- **IO Events Queue**：已完成的 IO 事件
- **Immediate Queue**：`setImmediate()` 回调函数在这里执行。
- **Close Handlers Queue**：一些关闭的回调函数，如：`socket.on('close', ...)`。

除了这 4 个主队列，还有另外 2 个队列，这两个队列不属于 libuv，属于 nodeJS 运行环境：

- **Next Ticks Queue**：使用 `process.nextTick()` 函数添加的回调，它比 **Other Microtasks Queue** 优先级高。
- **Other Microtasks Queue**：其他微任务队列，例如 promise 的 `then()` 回调、`queueMicroTask()`。

:::tip

使用队列的描述方式是不太准确的(说成队列是为了方便理解)，实际上数据结构类型各不相同，例如，计时器的处理使用了最小堆。
:::

下图展示了这个流程：

<a data-fancybox title="" href="http://cdn.yuzzl.top/blog/1_2yXbhvpf1kj5YT-m_fXgEQ.png">![](http://cdn.yuzzl.top/blog/1_2yXbhvpf1kj5YT-m_fXgEQ.png)</a>

事件循环的启动从定时器（timers）阶段开始，一旦一个阶段完成，事件循环就会检查上面说到的两个中间队列中是否有可用的回调。如果有，事件循环将立即开始处理它们，直到清空这两个队列为止。

下面我们关注一些细节内容。

### setTimeout() 如何执行

当调用 `setTimeout()` 时，它（称为定时器对象）会保存在**计时器堆**（timers heap），事件循环执行到**定时器阶段**时，会从中取出它们，然后进行时间的对比，如果超时，则执行相应的回调。

事件循环的核心代码位于 `src/win/core.c` 目录下：

```c {4}
int uv_run(uv_loop_t *loop, uv_run_mode mode) {
  while (r != 0 && loop->stop_flag == 0) {
    uv_update_time(loop);
    uv__run_timers(loop);
    // 这里讲 timers 阶段，省略下面其他阶段的代码
    // ....
  return r;
}
```

点进去看 `uv__run_timers(loop)`:

```c
void uv__run_timers(uv_loop_t *loop) {
    struct heap_node *heap_node;
    uv_timer_t *handle;

    for (;;) {
        heap_node = heap_min(timer_heap(loop));
        if (heap_node == NULL)
            break;

        handle = container_of(heap_node, uv_timer_t, heap_node);
        if (handle->timeout > loop->time)
            break;

        uv_timer_stop(handle);
        uv_timer_again(handle);
        handle->timer_cb(handle);
    }
}
```

这里维护了一个**最小堆**：

- 外面是一个死循环，每次循环开始会从计时器堆中拿到一个最小值。
- 如果堆为空，则跳出循环、执行下一阶段。
- 如果堆不为空，则取到定时器对象，判断计时器是否过期，如果最小值都没有过期，那么其它的肯定也不会过期，则跳出循环，执行下一阶段。
- 如果过期了，那么会调用相应的回调函数，然后重复上步操作，直到没有过期的计时器或者堆为空。

### setImmediate() 和 setTimeout()

这里放出一个经典问题，来看下面代码：

```javascript
setTimeout(function() {
  console.log('setTimeout')
}, 0);
setImmediate(function() {
  console.log('setImmediate')
});
```

这个程序的输出顺序是不能保证的。如果你多次运行这个程序，你会得到不同的输出。

其原因在于 NodeJS 将最小超时时间设置为 1 毫秒。由于这个上限，即使您将计时器设置为 0 毫秒延迟，延迟实际上会被重写并设置为 1 毫秒。

在事件循环的新一轮开始时，NodeJS 会执行 `uv_update_time(loop)`，通过系统调用来获取当前的时钟时间。

根据 CPU 的忙碌程度，获取当前时钟时间可能在 1 毫秒内完成，也可能不完成。

如果获取时间的速度足够快，小于 1 毫秒的速度恢复，则 node.js 会检测到计时器没有过期，因为计时器过期需要 1 毫秒。

但是，如果获取时间超过 1 毫秒，计时器将在时钟时间被检索时到期，这就导致 `setImmediate()` 先被打印。

请看下面代码：

```javascript
const fs = require('fs');

fs.readFile(__filename, () => {
  setTimeout(() => {
    console.log('timeout')
  }, 0);
  setImmediate(() => {
    console.log('immediate')
  })
});
```

下面的代码的输出顺序是可以保证的！分析如下：

- 程序执行，调用 `fs.readFile()`，它提供了一个回调函数，在读取文件后触发。
- 事件循环开始。
- 读取文件之后，事件循环的 IO 队列中将被添加一个事件（要执行的回调函数）。
- node 在 I/O 队列中看到文件读取事件，并执行它。
- 回调执行过程中，setTimeout 被添加到计时器队列，setImmediate 被添加到 Immediate 队列。
- IO 阶段结束，接下来我们到达 Immediate 阶段，所以 Immediate 一定比 setTimeout 先执行。

### 原生 Promise

来看下面代码：

```javascript
Promise.resolve().then(() => console.log('promise1 resolved'));
Promise.resolve().then(() => console.log('promise2 resolved'));
Promise.resolve().then(() => {
  console.log('promise3 resolved');
  process.nextTick(() => console.log('next tick inside promise resolve handler'));
});
Promise.resolve().then(() => console.log('promise4 resolved'));
Promise.resolve().then(() => console.log('promise5 resolved'));

setImmediate(() => console.log('set immediate1'));
setImmediate(() => console.log('set immediate2'));

process.nextTick(() => console.log('next tick1'));
process.nextTick(() => console.log('next tick2'));
process.nextTick(() => console.log('next tick3'));

setTimeout(() => console.log('set timeout'), 0);
setImmediate(() => console.log('set immediate3'));
setImmediate(() => console.log('set immediate4'));
```

- 五个 promise 的 `then` 回调将进入 **Other Microtasks Queue**。
- 两个 `setImmediate` 将进入 **SetImmediate Queue**。
- 三个 `next tick` 回调将进入 **nextTick queue**。
- 一个 `setTimeout` 回调将在适当的时刻进入 **timers Queue**。
- 两个 `setImmediate` 回调将进入 **SetImmediate Queue**。
- 事件循环将开始检查并处理 process.nextTick 队列。
- 检查 **Other Microtasks Queue**，处理相应的 promise 回调。
- 在上一步的过程中，一个新的 `nextTick` 回调被加入**nextTick queue**。node 会去处理它。直至没有更多的微任务。
- 事件循环进入计时器阶段，处理一个计时器回调。
- 进入检测（check）阶段，处理所有的 `set immediate`。

最终程序将打印如下内容：

```plain
next tick1
next tick2
next tick3
promise1 resolved
promise2 resolved
promise3 resolved
promise4 resolved
promise5 resolved
next tick inside promise resolve handler
set timeout
set immediate1
set immediate2
set immediate3
set immediate4
```

:::tip

对于一些**不同于原生 Promise** 的 Promise 库（如 **Q**），可能不会得到上面的输出，它们的 `then` 回调是利用 `process.nextTick()` 或者 `setImmediate()` 间接实现的。
:::

### node 11+ 对事件循环机制的影响

之前的流程图中的顶部有一句话：nextTick 和 promise 队列会在每一个 timer 和 immediate 回调之间执行。

请看下面代码：

```javascript
setTimeout(() => console.log('timeout1'));
setTimeout(() => {
  console.log('timeout2')
  Promise.resolve().then(() => console.log('promise resolve'))
});
setTimeout(() => console.log('timeout3'));
setTimeout(() => console.log('timeout4'));
```

将得到输出：

```shell
# node 11+
timeout1
timeout2
promise resolve
timeout3
timeout4

# node 10
timeout1
timeout2
timeout3
timeout4
promise resolve
```

这样的更新是为了和浏览器行为相匹配。

### 最佳实践

#### 避免在重复调用的代码块中进行同步 I/O

尽量避免在重复调用的代码块中同步 I/O 函数(fs.readFileSync、 fs.renameSync 等) ，比如循环和经常调用的函数。

这会在很大程度上降低应用程序的性能，因为每次执行同步 I/O 操作时，事件循环都会一直被阻塞，直到完成。

#### 函数应该完全异步或者完全同步

请看下面代码：

```javascript
const cache = {};

function readFile(fileName, callback) {
  if (cache[filename]) {
    return callback(null, cache[filename])
  }

  fs.readFile(fileName, (err, fileContent) => {
    if (err) return callback(err);

    cache[fileName] = fileContent;
    callback(null, fileContent);
  });
}

function letsRead() {
  readFile('myfile.txt', (err, result) => {
    // error handler redacted
    console.log('file read complete');
  });

  console.log('file read initiated')
}
```

如果我们调用两次 `letsRead` 将输出：

```plain
file read initiated
file read complete


file read complete
file read initiated 
```

前后顺序不一致！不难推测出后面的代码是完全同步的，而前面的代码执行掺杂了异步的操作。

当我们的应用程序变得越来越复杂时，这种不一致的同步 - 异步混合函数可能会导致许多问题，这些问题极难调试和修复。

因此，强烈建议始终遵循上面的同步或异步规则，例如上面的代码可以改为：

```javascript
const cache = {};

function readFile(fileName, callback) {
  if (cache[filename]) {
    return process.nextTick(() => callback(null, cache[filename]));
  }

  fs.readFile(fileName, (err, fileContent) => {
    if (err) return callback(err);

    cache[fileName] = fileContent;
    callback(null, fileContent);
  });
}
```

## 参考资料

nodejs
官网，[The Node.js Event Loop, Timers, and process.nextTick()](https://nodejs.org/en/docs/guides/event-loop-timers-and-nexttick/)

Deepal
Jayasekara，[NodeJS Event Loop 系列文章](https://blog.insiderattack.net/event-loop-and-the-big-picture-nodejs-event-loop-part-1-1cb67a182810)



