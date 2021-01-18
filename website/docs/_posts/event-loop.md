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

> 事件循环是 NodeJS 处理非阻塞 I/O 操作的机制——尽管 JavaScript 是单线程处理的。


这里顺便提一下 **IO**：维基百科这样描述：I/O 通常指数据在存储器（内部和外部）或其他周边设备之间的输入和输出，是信息处理系统（例如计算机）与外部世界（可能是人类或另一信息处理系统）之间的通信。 我们 node
开发环境中最常见的有**文件读写**、**网络请求**操作。

对于浏览器，用户交互（如浏览器鼠标事件）、网络（ajax 请求）是浏览器内部提供的 API （当然再往底层走也是面向操作系统）。

综上所述，事件循环是 JavaScript 引擎和浏览器接口/操作系统沟通的一座桥梁，是浏览器、NodeJS 实现异步的方法。

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

- **宏任务队列**（macrotask queue）：**ajax**、**setTimeout**、**setInterval**、**DOM监听**等。
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

- 打印 **start** 字符串。
- `setTimeout()` 进入 **macrotask queue**。
- `Promise.then()` 后的回调进入 **microtask queue**。
- 执行最后一行，打印 end 字符串。
- 全局代码执行完毕，接下来执行 **microtask** 的任务，打印 promise1、promise2。
- 这时 microtask 队列已经为空，从上面的流程图可知，接下来主线程可能会去做一些 UI 渲染工作，然后开始下一轮 event loop， 执行 `setTimeout()` 的回调，打印出 **setTimeout!**
  字符串。

接下来，我们介绍 NodeJS 的事件循环，其机制比浏览器复杂得多。

## NodeJS 的事件循环

NodeJS 的事件循环的核心是 **[libuv](https://zh.wikipedia.org/wiki/Libuv)** 库，它提供对基于事件循环的异步 I/O 的支持。

- 我们的 JavaScript 会被送到 **v8** 引擎进行处理。
- 代码中会调用 Node API，会交给 libuv 库处理。
- libuv 通过一个事件循环（可以理解为轮询）来查询结果，并将结果放到事件队列中，然后交给 v8 引擎。

### 流程

下图是事件循环的流程，一次事件循环又被称为一次 **Tick**，**每个阶段都有一个队列来执行回调**。不同类型的事件在它们自己的队列中排队。

- **定时器（timers）**：本阶段执行已经被 `setTimeout()` 和 `setInterval()` 的调度回调函数。
- **待定回调（pending callbacks）**：执行延迟到下一个循环迭代的 I/O 回调。
- **idle, prepare**：仅系统内部使用。
- **轮询（poll）**：检索新的 I/O 事件、执行与 I/O 相关的回调（几乎所有情况下，除了关闭的回调函数，那些由计时器和 `setImmediate()` 调度的之外），其余情况 node 将在适当的时候在此阻塞。
- **检测（check）**：`setImmediate()` 回调函数在这里执行。
- **关闭的回调函数（close callbacks）**：一些关闭的回调函数，如：`socket.on('close', ...)`。

下图展示了这个流程：

<a data-fancybox title="" href="http://cdn.yuzzl.top/blog/1_2yXbhvpf1kj5YT-m_fXgEQ.png">![](http://cdn.yuzzl.top/blog/1_2yXbhvpf1kj5YT-m_fXgEQ.png)</a>

可以看出，**Expired timers** 即上面的定时器阶段、**IO Events** 即上面的 `poll` 阶段、`close Handlers` 即上面的 `close callbacks` 阶段。

我们还注意到两个中间队列，（这两个队列不属于 libuv，属于 nodeJS 运行环境）：

- **Next Ticks Queue**：使用 `process.nextTick()` 函数添加的回调，它比 **Other Microtasks Queue** 优先级高。
- **Other Microtasks Queue**：其他微任务队列，例如 promise 的 `then()` 回调、`queueMicroTask()`。

事件循环的启动从定时器（timers）阶段开始，一旦一个阶段完成，事件循环就会检查上面说到的两个中间队列中是否有可用的回调。如果有，事件循环将立即开始处理它们，直到清空这两个队列为止。

下面我们关注一些细节内容。

### setTimeout() 如何执行

当调用 `setTimeout()` 时，它（称为定时器对象）会保存在**计时器堆**（timers heap），事件循环执行到**定时器阶段**时，会从中取出它们，然后进行时间的对比，如果超时，则执行相应的回调。

实践出真知，让我们从源码中一探究竟：

首先，我们很容易地找到事件循环的核心代码，它位于 `src/win/core.c` 目录下：

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

正好，几个月前学的数据结构 -- **堆**派上用场了，可以看出这里维护了一个**最小堆**：

- 外面是一个死循环，每次循环开始会从计时器堆中拿到一个最小值。
- 如果堆为空，则跳出循环、执行下一阶段。
- 如果堆不为空，则取到定时器对象，判断计时器是否过期，如果最小值都没有过期，那么其它的肯定也不会过期，则跳出循环，执行下一阶段。
- 如果过期了，那么会调用相应的回调函数，然后重复上步操作，直到没有过期的计时器或者堆为空。

### setImmediate() 和 setTimeout()

这里放出一个经典问题，来看下面代码：

```javascript
setTimeout(function () {
  console.log('setTimeout')
}, 0);
setImmediate(function () {
  console.log('setImmediate')
});
```

这个程序的输出顺序是不能保证的。如果你多次运行这个程序，你会得到不同的输出。

其原因在于 NodeJS 将最小超时时间设置为1毫秒。由于这个上限，即使您将计时器设置为0毫秒延迟，延迟实际上会被重写并设置为1毫秒。

在事件循环的新一轮开始时，NodeJS 会执行 `uv_update_time(loop)`，通过系统调用来获取当前的时钟时间。

根据 CPU 的忙碌程度，获取当前时钟时间可能在1毫秒内完成，也可能不完成。

如果获取时间的速度足够快，小于1毫秒的速度恢复，则 node.js 会检测到计时器没有过期，因为计时器过期需要1毫秒。

但是，如果获取时间超过1毫秒，计时器将在时钟时间被检索时到期，这就导致 `setImmediate()` 先被打印。

### 原生 Promise

上图已经指出，promise 的 `then()` 回调属于**其他微任务队列（Other Microtasks Queue）**，来看下面代码：

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

```
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

## 参考资料

nodejs官网，[The Node.js Event Loop, Timers, and process.nextTick()](https://nodejs.org/en/docs/guides/event-loop-timers-and-nexttick/)

Deepal
Jayasekara，[NodeJS Event Loop 系列文章](https://blog.insiderattack.net/event-loop-and-the-big-picture-nodejs-event-loop-part-1-1cb67a182810)