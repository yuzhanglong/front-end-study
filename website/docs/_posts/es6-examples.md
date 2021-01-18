---
date: 2020-12-26

tags:

- JavaScript

---

# 一些有趣的 ES6 案例分析

## 总述

本文收集了个人在平时学习中的一些有趣的 ES6 案例。

本文不定期更新，随着我的学习，这篇文章会不断地补充完善。

[[toc]]

## Symbol

### React 利用 Symbol 防止 XSS 攻击

我们都知道，React 元素是一个 `plain object`:

```javascript
let el = {
  type: 'marquee',
  props: {
    bgcolor: '#ffa7c4',
    children: 'hi',
  },
  key: null,
  ref: null,
  $$typeof: Symbol.for('react.element'),
}
```

如果你的服务器有允许用户存储任意 JSON 对象的漏洞，而前端需要一个字符串，这可能会发生一个问题：

```javascript
// 服务端允许用户存储 JSON
let expectedTextButGotJSON = {
  type: 'div',
  props: {
    dangerouslySetInnerHTML: {
      __html: 'dangerous InnerHTML'
    },
  },
  // ...
};
let message = {text: expectedTextButGotJSON};
```

然后在某段JSX中使用了它，攻击者就可以运行我们不期望的 html 代码：

```jsx
// React 0.13 中有风险
<p>
  {message.text}
</p>
```

但是React在之后的版本中使用了 `Symbol` 标记React元素：

```javascript
let el = {
  type: 'marquee',
  props: {
    bgcolor: '#ffa7c4',
    children: 'hi',
  },
  key: null,
  ref: null,
  $$typeof: Symbol.for('react.element'),
}
```

因为JSON不支持 `Symbol` 类型。所以即使服务器存在用JSON作为文本返回安全漏洞，JSON 里也不包含 `Symbol.for('react.element')`。React 会检测 `element.$$typeof`
，如果元素丢失或者无效，会**拒绝处理**该元素。

### vue-router-next 利用 Symbol 防止属性污染

vue-router 利用 `app.provide` 这个API，将 `routerKey` 等全局对象挂载到全局 `vue` 实例上： 为了防止属性污染，`key` 值在这里被设置为一个 `Symbol`：

```typescript
// PolySymbol 返回一个合适的 Symbol 如果浏览器环境不支持，则直接返回一个字符串
export const PolySymbol = (name: string) =>
  hasSymbol
    ? Symbol(__DEV__ ? '[vue-router]: ' + name : name)
    : (__DEV__ ? '[vue-router]: ' : '_vr_') + name

export const routerKey = /*#__PURE__*/ PolySymbol(
  __DEV__ ? 'router' : 'r'
) as InjectionKey<Router>

app.provide(routerKey, router)
app.provide(routeLocationKey, reactive(reactiveRoute))
app.provide(routerViewLocationKey, currentRoute)
```

vue-router 的其他模块就可以通过 `routerKey` 优雅地拿到全局 `router` 对象，其中 `inject()` 方法是 `vue` 取得全局对象属性的 API。

```typescript
setup = () => {
  const link = reactive(useLink(props))
  const {options} = inject(routerKey)!
  // 省略其他内容
}
```

## Set 和 Map 数据结构

### 优雅地实现数组/字符串去重

基于集合没有重复元素的特点，我们可以优雅地实现**数组去重**，来看下面代码：

```javascript
let myArr = [1, 1, 2, 3, 5];
let uniqueElementsArr = [...new Set(myArr)];
console.log(uniqueElementsArr);
// [1, 2, 3, 5]
```

或是去除字符串里面的重复字符：

```javascript
let myStr = "hello world!";
let newStr = [...new Set(myStr)];
console.log(newStr.join(""));
// "helo wrd!"
```

### 利用 weakMap 防止内存泄露

来看下面的例子，下面的 `e1` 和 `e2` 是两个对象，我们通过 `arr` 数组对这两个对象添加一些文字说明。这就形成了 `arr` 对 `e1` 和 `e2` 的引用。

```javascript
const e1 = document.getElementById('foo');
const e2 = document.getElementById('bar');
const arr = [
  [e1, 'foo 元素'],
  [e2, 'bar 元素'],
];
```

如果我们不需要 `e1` 和 `e2`，就必须手动解除引用，此类代码很容易被开发者遗忘：

```javascript
arr [0] = null;
arr [1] = null;
```

使用 `weakmap` 就可以规避这种麻烦：

```javascript
const wm = new WeakMap();

const element = document.getElementById('example');

wm.set(element, 'some information');
wm.get(element);
```

## Proxy 和 Reflect

### vue3.0 利用 Proxy+Reflect 实现数据劫持

我们都知道 vue2 的数据劫持是 `defineProperty`，`defineProperty` 有一些缺点，例如一次只能操作一个对象的一个属性，要监听整个对象需要多层的递归。

另外，`Object.defineProperty()` 无法监听数组类型属性的变化，vue 使用了一些比较 hack 的方法来实现它，但是还有一些缺陷，例如通过下标修改数组的情况仍无法监测。

Proxy 非常优雅地解决了这些问题，我们以 vue3 的 `reactive()` API为例了解一下，来看看官方这个 test：

:::tip

- 下面的代码只列出主干部分的代码，更多细节可自行阅读源码。我们主要的目的是了解 Proxy 和 Reflect 的特性。

- 响应式 API 的源码位于 `vue-next/packages/reactivity` 下。

:::

```typescript
test('original value change should reflect in observed value (Object)', () => {
  const original: any = {foo: 1}
  const observed = reactive(original)
  // set
  original.bar = 1
  expect(original.bar).toBe(1)
  expect(observed.bar).toBe(1)
  // delete
  delete original.foo
  expect('foo' in original).toBe(false)
  expect('foo' in observed).toBe(false)
});
```

首先调用 `reactive()`，将 `original` 响应化。

```typescript
// if trying to observe a readonly proxy, return the readonly version.
if (target && (target as Target)[ReactiveFlags.IS_READONLY]) {
  return target
}
return createReactiveObject(
  target,
  false,
  mutableHandlers,
  mutableCollectionHandlers
)
```

这是核心方法，创建一个响应式对象，它最终返回一个 `proxy`：

```typescript
function createReactiveObject(
  target: Target,
  isReadonly: boolean,
  baseHandlers: ProxyHandler<any>,
  collectionHandlers: ProxyHandler<any>
) {
  // 其它的代码省略

  // 核心部分
  const proxy = new Proxy(
    target,
    targetType === TargetType.COLLECTION ? collectionHandlers : baseHandlers
  )
  proxyMap.set(target, proxy)
  return proxy
}
```

这里 new 了一个 `Proxy`，第一个参数传入的是要被代理的对象，第二个参数是一个对象， 对于每一个被代理的操作，需要提供一个对应的处理函数，该函数将拦截对应的操作，在这里是 `baseHandlers`：

```typescript
export const mutableHandlers: ProxyHandler<object> = {
  get,
  set,
  deleteProperty,
  has,
  ownKeys
}
```

可以看出这里重定义了 `get`、`set` 等方法，`get` 方法实际上调用了 `createGetter`：

```typescript
function createGetter(isReadonly = false, shallow = false) {
  // 省略一些细节代码
  return function get(target: Target, key: string | symbol, receiver: object) {

    // 使用 Reflect.get 来调用系统内部(默认)的 get 方法
    const res = Reflect.get(target, key, receiver)

    return res
  }
}
```

注意这里的 `Reflect.get()` 这个 API 称为**反射**，Proxy对象的方法，就能在Reflect对象上找到对应的方法。这就让Proxy对象可以方便地调用对应的Reflect方法，完成**默认行为**。

Reflect 的意义在于**保证原生行为能够正常执行**。

再看 `set`，它本质上是调用 `createSetter()`：

```typescript
function createSetter(shallow = false) {
  return function set(
    target: object,
    key: string | symbol,
    value: unknown,
    receiver: object
  ): boolean {
    const oldValue = (target as any)[key]
    // 调用默认的 set 方法
    const result = Reflect.set(target, key, value, receiver)
    // 调用 `trigger()` 通知 订阅者更新
    if (target === toRaw(receiver)) {
      trigger(target, TriggerOpTypes.SET, key, value, oldValue)
    }
    return result
  }
}
```

我们在 `set` 方法中执行劫持 -- 首先我们调用 `Reflect.set`，也就是 `set` 方法的**默认行为**，接着补充额外的逻辑，例如通知订阅者的 `trigger()`。

也就是当用户修改值，例如调用 `original.bar = 1` 时代码就会走到这个函数里，我们只需在这里实现我们的通知发布即可，具体的发布实现这里不展开，以后我会专门开一篇详细分析。

## Iterator 和 Generator

下图很好地说明了两者之间的关系。

<a data-fancybox title="" href="http://cdn.yuzzl.top/blog/relationships.png">![](http://cdn.yuzzl.top/blog/relationships.png)</a>

### 利用 Generator 让异步代码更加优雅

我们都知道，异步代码可以用 `Promise` 来处理，能够有效地解决**回调地狱**问题：

```javascript
// 读取文件 A
readFile(fileA)
  .then(function (data) {
    // 获取 A 内容
    console.log(data.toString());
  })
  .then(function () {
    // 读取 B
    return readFile(fileB);
  })
  .then(function (data) {
    // 获取 B 内容
    console.log(data.toString());
  })
  .catch(function (err) {
    console.log(err);
  });
```

`Promise` 挺不错，但是也有一些问题，例如大量冗余的代码 -- 跟着一大堆 `then`，异步逻辑一多，代码会非常难以维护。

我们可能会期望这样的代码，在 `console.log(result)` 中拿到结果 "hello world"：

```javascript
function foo() {
  // 利用 setTimeout 模拟网络请求
  const res1 = new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve("hello world");
    }, 1000);
  });
  const res2 = new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve("yzl!");
    }, 1000);
  });
  // 这里是无法拿到 hello world 的
  console.log(res1);
  // 这里是无法拿到 yzl 的
  console.log(res2);
}
```

显然直接这样是不行的，于是我们可以利用生成器函数：

```javascript
function* bar() {
  console.log('hi~');

  // 利用 setTimeout 模拟网络请求
  const res1 = yield new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve("hello world!");
    }, 1000);
  });
  const res2 = yield new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve("yzl!");
    }, 1000);
  });

  // 我们希望拿到 hello world!
  console.log(res1);
  // 我们希望拿到 yzl!
  console.log(res2);
}
```

如何执行这部分代码？我们只需要这样做：

- 初始化生成器
- 通过 `it1.next().value` 拿到第一个 `yield` 后面的内容，也就是第一个 `Promise` 对象。
- 在调用 `Promise.then()`，在回调函数中拿到结果 `res`.
- 在回调函数中调用 `iterator.next(res)`, next函数的参数即为上一个 `yield` 表达式的返回值，则 `res` 为 `hello world!`。
- 以此类推处理第二个 `yield`。

```javascript
const iterator = bar();
let it1 = iterator.next();

it1.value.then(res => {
  let it2 = iterator.next(res);
  it2.value.then(res => {
    iterator.next(res);
  })
});
```

看看效果：

<a data-fancybox title="" href="http://cdn.yuzzl.top/blog/20201211000706.png">![](http://cdn.yuzzl.top/blog/20201211000706.png)</a>

`function* bar()` 中的内容算是比较优雅了（看着更像同步操作），但是依然有很大的问题：

- 但是那坨分离出来的代码如何解决，也就是说，如何**自动执行 Generator 函数**？
- 上面的代码只适用于2个 `Promise` 如果有很多的 `promise`，如何解决？

来看下面的 `generatorRunner()`，它可以自动执行 Generator 函数，同时使用递归地方式处理多个 `Promise`：

```javascript
const generatorRunner = (fn) => {
  let iterator = fn();

  const next = (res = undefined) => {
    let result = iterator.next(res);
    if (result.done) {
      return;
    }
    result.value.then(res => {
      next(res);
    });
  }
  next();
}

generatorRunner(bar);
```

看看效果：

<a data-fancybox title="" href="http://cdn.yuzzl.top/blog/20201211000618.png">![](http://cdn.yuzzl.top/blog/20201211000618.png)</a>

这种能够自动执行 `Generator` 的函数我们又称为**Thunk函数**。当然，这是一个比较简单的版本，现在我们有类似的库，名为**Co**
，[点击查看源码](https://github.com/tj/co/blob/master/index.js)。

```javascript
function co(gen) {
  var ctx = this;
  var args = slice.call(arguments, 1);
  // 使用 promise 包裹，目的是防止 promise 的死循环，最终导致内存泄漏
  return new Promise(function (resolve, reject) {

    // 初始化生成器
    if (typeof gen === 'function') gen = gen.apply(ctx, args);

    // 不是函数，直接 resolve
    if (!gen || typeof gen.next !== 'function') return resolve(gen);

    // 执行 下面的 onFulfilled
    onFulfilled();

    function onFulfilled(res) {
      var ret;
      try {
        ret = gen.next(res);
      } catch (e) {
        return reject(e);
      }
      // 这里的 next 是下面出现的 next 函数
      next(ret);
      return null;
    }

    function next(ret) {
      // 如果 为 done 状态，我们直接 resolve
      if (ret.done) return resolve(ret.value);
      // 将 value 转成 promise，目的是防止 promise 的死循环，最终导致内存泄漏
      // toPromise 请自行查阅源码
      var value = toPromise.call(ctx, ret.value);
      // 将 onFulfilled 传给 `value.then` 这个新的 promise，这其实就是一个递归
      if (value && isPromise(value)) return value.then(onFulfilled, onRejected);

      // 出错，reject
      return onRejected(new TypeError('You may only yield a function, promise, generator, array, or object, '
        + 'but the following object was passed: "' + String(ret.value) + '"'));
    }

    function onRejected(err) {
      var ret;
      try {
        ret = gen.throw(err);
      } catch (e) {
        return reject(e);
      }
      next(ret);
    }
  });
}
```

### 利用基于 generator 的 redux-saga 执行具有副作用的函数

我们都知道 Redux 规定 `action` 必须是一个简单对象（`plain object`）。 但是我们可能需要 `action` 是一个函数（这种需求是很强烈的，例如网络请求），将它执行过程中的某个内容 `dispatch`
，然后实现更新。

redux 有一些中间件提供了一些解决方案，例如 `redux-thunk` 和 `redux-saga`，其中，`redux-saga` 是基于 generator 的一个不错的实践，结合下图，来看看它的用法。

<a data-fancybox title="" href="http://cdn.yuzzl.top/blog/20201211132141.png">![](http://cdn.yuzzl.top/blog/20201211132141.png)</a>

## 异步工具 -- Promise、async 和 await

### 实现 promise 的链式调用

你用过 vue-router 吗？如果你用过，你应该知道 vue-router 可以在某个守卫上注册多次，且这些守卫都会按你添加的顺序执行。

实际上其底层就是 promise **链式调用**的一种体现，我们可以写一个类似的链式 Promise：

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

运行结果如下：

![promise](http://cdn.yuzzl.top/blog/20201217185242.png)

这里巧妙地利用了数组的 `reduce` API，通过一个 **resolved Promise** 作为初值，让**后一个 promise** 作为**前一个 promise** 的 then 回调的返回值。

### Promise 的超时中断

用 promise 封装 ajax 请求，如果这个请求超时了，我们该如何优雅地中断？来看下面代码：

```javascript
// 本质上利用了闭包
let cancelToken = undefined;
const myPromise = new Promise((resolve, reject) => {
  let timeout = setTimeout(() => {
    resolve("promise resolved!");
  }, 3000);

  cancelToken = () => {
    clearTimeout(timeout);
    reject("promise rejected!");
  };
});

myPromise
  .then(res => {
    console.log(res);
  })
  .catch(err => {
    console.log(err);
  });

cancelToken();
```

输出：

```
promise rejected!
```

`cancelToken` 在 Promise 中会成为一个函数，这个函数一旦执行，则调用 promise 中的 **reject** 方法。

值得注意的是，不要忘记在 `cancelToken` 函数中将定时器清除掉，否则 reject 之后定时器还会继续执行。

知名的网络请求库 **axios** 的**网络请求中断**功能就是通过这个方法实现的，只不过把这里的 `clearTimeout(timeout)` 换成 `XMLHttpRequest.abort()` 即可。

### 超时中断的另一种方案

上面说到利用 `cancelToken` 方法来进行超时中断，实际上我们还可以使用 `Promise.race(iterable)` 方法来实现。

它的原理是传入多个 promise，一旦某个 promise 解决或拒绝，返回的 promise 就会解决或拒绝。

```javascript
// 中断方案2 基于 promise.race()

let t = undefined;
const cancelablePromise = (promise) => {
  let p2 = new Promise((resolve, reject) => {
    setTimeout(() => {
      reject('超过 1s，中断 promise！');
      clearTimeout(t);
    }, 1000);
  });
  return Promise.race([promise, p2]);
}


const myPromise2 = new Promise((resolve, reject) => {
  t = setTimeout(() => {
    resolve("promise resolved!");
  }, 3000);
});

cancelablePromise(myPromise2)
  .then(res => {
    console.log(res);
  })
  .catch(err => {
    console.log(err);
  })
```

`Promise.race()` 的实现很简单，返回一个 promise，一旦传入的多个 promise 中的某个 promise 解决或拒绝，返回的 promise就会解决或拒绝：

```javascript
const isPromise = (p) => {
  if ((typeof p === "object" && p !== null) || typeof p === "function") {
    return typeof p.then === "function";
  }
  return false;
}

Promise.race = (promises) => {
  return new Promise((resolve, reject) => {
    for (let i = 0; i < promises.length; i++) {
      let currentPromise = promises[i];
      if (isPromise(currentPromise)) {
        currentPromise.then(resolve, reject)
      } else {
        resolve(currentPromise);
      }
    }
  })
}
```

### 实现 Promise.all()

`promise.all()` 传入多个 promise，这些 promise 全部 resolved 才成功否则执行失败逻辑：

```javascript
const isPromise = (p) => {
  if ((typeof p === "object" && p !== null) || typeof p === "function") {
    return typeof p.then === "function";
  }
  return false;
}

Promise.myAll = (promises) => {
  return new Promise((resolve, reject) => {
    let res = [];

    const processData = (index, data) => {
      res[index] = data;
      if (res.length === promises.length) {
        resolve(res);
      }
    }


    for (let i = 0; i < promises.length; i++) {
      let currentPromise = promises[i];
      if (isPromise(currentPromise)) {
        currentPromise.then(res => {
          processData(i, res);
        }, reject);
      } else {
        processData(i, currentPromise);
      }
    }
  })
}

const testPromises = new Array(10)
  .fill(null)
  .map((item, index) => {
    return Promise.resolve("promise " + index + " resolved!");
  });

Promise
  .all(testPromises)
  .then(res => {
    console.log(res);
  });
```

### 让异步编程更简单的 async 和 await

使用 promise 处理异步已经比较优雅了，但是我们会发现有大量的 then 的代码块，不利于维护，代码也不好看：

```javascript
const promise1 = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve("promise1 resolved!")
    }, 1000);
  })
}

const promise2 = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve("promise2 resolved!")
    }, 1000);
  })
}

const promise3 = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve("promise3 resolved!")
    }, 1000);
  })
}


promise1()
  .then(res => {
    console.log(res);
    return promise2();
  })
  .then(res => {
    console.log(res);
    return promise3();
  })
  .then(res => {
    console.log(res);
  })
```

使用 async / await 之后，它看起来更加优雅，更加像同步代码：

```javascript
const foo = async () => {
  let res1 = await promise1();
  console.log(res1);
  let res2 = await promise2();
  console.log(res2);
  let res3 = await promise3();
  console.log(res3);
}

foo().then(res => {
  console.log(res);
})
```

## 参考资料

Matt Frisble，JavaScript 高级程序设计（第四版）

MDN，[async和await:让异步编程更简单](https://developer.mozilla.org/zh-CN/docs/learn/JavaScript/%E5%BC%82%E6%AD%A5/Async_await)

Dan
Abramov，[Why Do React Elements Have a $$typeof Property?](https://overreacted.io/why-do-react-elements-have-typeof-property/)

Vincent Driessen，[Iterables vs. Iterators vs. Generators](https://nvie.com/posts/iterators-vs-generators/)
