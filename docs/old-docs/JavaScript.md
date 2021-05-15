# JavaScript

https://zhuanlan.zhihu.com/p/72923073

http://www.conardli.top/blog/article/JS%E8%BF%9B%E9%98%B6/%E5%A6%82%E4%BD%95%E5%86%99%E5%87%BA%E4%B8%80%E4%B8%AA%E6%83%8A%E8%89%B3%E9%9D%A2%E8%AF%95%E5%AE%98%E7%9A%84%E6%B7%B1%E6%8B%B7%E8%B4%9D.html#%E5%BE%AA%E7%8E%AF%E5%BC%95%E7%94%A8

https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Object/setPrototypeOf

https://juejin.im/post/6844903584023183368

http://www.conardli.top/blog/article/%E5%89%8D%E7%AB%AF%E5%B7%A5%E7%A8%8B%E5%8C%96/%E5%89%8D%E7%AB%AF%E5%B7%A5%E7%A8%8B%E5%8C%96-%E5%89%96%E6%9E%90npm%E7%9A%84%E5%8C%85%E7%AE%A1%E7%90%86%E6%9C%BA%E5%88%B6%EF%BC%88%E5%AE%8C%E6%95%B4%E7%89%88%EF%BC%89.html#_3-6-%E6%95%B4%E4%BD%93%E6%B5%81%E7%A8%8B

## 闭包

### 什么是闭包？

引用了**另一个函数作用域**中变量的函数，通常在嵌套函数中实现。

```javascript
function createComparisonFunction(propertyName) {
  return function (object1, object2) {
    let value1 = object1[propertyName];
    let value2 = object2[propertyName];

    if (value1 < value2) {
      return -1;
    } else if (value1 > value2) {
      return 1;
    } else {
      return 0;
    }
  };
}
```

注意这两行代码：

```javascript
let value1 = object1[propertyName];
let value2 = object2[propertyName];
```

这两行代码位于**内部函数**中（是一个匿名函数），引用了**外部函数变量**`propertyName`, 在这个函数被返回并在其它地方被使用时，它仍然引用这那个变量。本质上是**内部函数的作用域链**
包含了`createComparisonFunction()`的作用域。

### 上下文和作用域链

如果需要深刻了解闭包，就需要了解上下文和作用域链。

#### 上下文（Context）

变量或函数的上下文决定了它们可以访问哪些数据，以及它们的行为。 例如，`window`对象被称为全局上下文(浏览器环境)
。上下文在其所有代码都执行完毕后会被销毁。（例如在浏览器环境下，全局上下文在应用程序退出前才会被销毁，比如关闭网页或退出浏览器）。

每个函数调用都有自己的上下文。当代码执行流进入函数时，函数的上下文被推到一个**上下文栈上**。在函数执行完之后，上下文栈会弹出该函数上下文，将控制权返还给之前的执行上下文。

例如:

```javascript
const a = () => {
  b();
  console.log("aaa");
}

const b = () => {
  console.log("bbb");
}

a();
```

当执行`a()`，即代码执行流进入`a()`时，a的执行上下文**入栈**。

![image-20201021235457924](C:\Users\yuzhanglong\AppData\Roaming\Typora\typora-user-images\image-20201021235457924.png)

`a()`执行到第一行，代码执行流到`b()`, `b()` **入栈**。

![image-20201021235523638](C:\Users\yuzhanglong\AppData\Roaming\Typora\typora-user-images\image-20201021235523638.png)

`b()`执行完成，`b()`**出栈**，控制权转移到`a()`的上下文。

![image-20201021235544722](C:\Users\yuzhanglong\AppData\Roaming\Typora\typora-user-images\image-20201021235544722.png)

`a()`执行完成，`a()`**出栈**。

![image-20201021235555293](C:\Users\yuzhanglong\AppData\Roaming\Typora\typora-user-images\image-20201021235555293.png)

上下文中的代码在执行的时候，会创建变量对象的一个**作用域链**。这个作用域链决定了各级上下文中的代码在**访问变量和函数时的顺序**
。代码正在执行的上下文的变量对象始终位于作用域链的最前端。如果上下文是函数，则其活动对象（activation object）用作变量对象。活动对象最初只有一个定义变量：**arguments**
。作用域链中的下一个变量对象来自包含上下文，再下一个对象来自再下一个包含上下文。以此类推直至全局上下文；全局上下文的变量对象始终是作用域链的**最后一个变量对象**。

#### [[scopes]]

`[[scopes]]`是所有父变量对象的层级链，处于当前函数上下文之上，[[scope]]在函数创建时被存储，且不会发生改变，与函数共存亡。

> 注意：`[[scopes]]`不是上下文。

#### 一个不错的案例：foo()  Demo

我们在浏览器环境下调试下面这个`foo Demo`，有助于更好理解这些概念。

浏览器中运行下面的代码，注意调用栈和我们的`foo`、`bar`：

```javascript
// foo Demo
// 参考资料：https://www.cnblogs.com/TomXu/archive/2012/01/18/2312463.html
// 下面的解释的部分内容也参考了这篇文章

var x = 10;

function foo() {
  var y = 20;

  function bar() {
    var z = 30;
    alert(x + y + z);
  }

  bar();
}

debugger;
console.log("foo被创建");
foo(); // 60
console.log("foo被执行");
```

##### foo创建

首先，程序在`debugger`断点处停止，此时函数`foo`并没有执行。

结合下图，我们得到以下信息：

![](http://cdn.yuzzl.top/blog/20201101225709.png)

- 此时的调用栈（call stack）只有一个全局的**执行上下文**。

- 此时的**全局变量对象**（VO）为：

  ```javascript
  globalContext.VO = {
    x: 10
    foo: <reference to function>
  };
  ```

- foo已经完成创建，但未执行，它的[[scopes]]属性为(我们忽略`Script`，这个应该是浏览器环境下特有的)：

  ```javascript
  foo.[[scopes]] = [
  	globalContext.VO
  ]
  ```

##### foo的执行

我们单步调试，进入`foo()`，但不执行`bar()`：

结合下图，我们得到以下信息：

![](http://cdn.yuzzl.top/blog/20201101225731.png)

- 此时的调用栈的栈顶为当前执行上下文`foo`。

- 当前执行上下文`foo`的**活动对象**（AO）为：

  ```javascript
  fooContext.AO = {
    y: 20
    bar: <reference to function>
  }
  ```

- 当前执行上下文`foo`的**作用域链**为：

  ```javascript
  fooContext.Scope = fooContext.AO + foo.[[scopes]]
  foo.[[scopes]] = [
    globalContext.VO,
    fooContext.AO
  ]
  ```

- 内部函数`bar`在此时也被创建，它的[[scope]]为：

  ```javascript
  bar.[[scopes]] = [
  	fooContext.AO,
  	globalContext.VO
  ]
  ```

##### bar的执行

我们继续单步，执行我们的`bar()`:

![](http://cdn.yuzzl.top/blog/20201101225642.png)

结合下图，我们得到以下信息：

- `bar`执行时，`bar`上下文的活动对象为：

  ```javascript
  barContext.AO = {
    z: 30
  };
  ```

- `bar`上下文的作用域链为：

  ```javascript
  barContext.Scope = barContext.AO + bar.[[scopes]]
   
  barContext.Scope = [
    barContext.AO,
    fooContext.AO,
    globalContext.VO
  ];
  ```

##### 更直观的表示

![](http://cdn.yuzzl.top/blog/20201101225756.png)

### 闭包的深入理解

#### 闭包的本质

从上面的解释中我们不难得到闭包的本质：**内部函数的作用域链**包含了**外部函数的作用域**。

#### 值得注意的地方

##### 所有的函数都是闭包

根据函数创建的算法，我们看到 在ECMAScript中，**所有的函数都是闭包**，因为它们都是在创建的时候就保存了**上层上下文的作用域链**。（不管这个函数后续是否被执行，因为上面提到过，`[[scopes]]`
在函数创建的时候就有了）。

##### 所有对象都引用一个`[[scopes]]`

在ECMAScript中，同一个父上下文中创建的闭包是**共用一个`[[scopes]]`属性**的。也就是说，某个闭包对其中`[[scopes]]`的变量做修改会影响到其他闭包对其变量的读取。

例如下面这个经典案例：

```javascript
var data = [];

for (var k = 0; k < 3; k++) {
  data[k] = function () {
    alert(k);
  };
}

data[0](); // 3, 而不是0
data[1](); // 3, 而不是1
data[2](); // 3, 而不是2

// 原理
data[0].[[scopes]] === data[1].[[scopes]] === data[2].[[scopes]] === Scopes = [
  ... // 其它变量对象
    {data: [...], k: 3} // 活动对象
]
```

我们使用闭包的方法来解决问题：

```javascript
var data = [];

for (var k = 0; k < 3; k++) {
  data[k] = (function _helper(x) {
    return function () {
      alert(x);
    };
  })(k); // 传入"k"值
}

// 现在结果是正确的了
data[0](); // 0
data[1](); // 1
data[2](); // 2

// 原理
data[0].[[Scope]] === [
  ... // 其它变量对象
    父级上下文中的活动对象AO
:
{
  data: [...], k
:
  3
}
,
_helper上下文中的活动对象AO: {
  x: 0
}
]
;

data[1].[[Scope]] === [
  ... // 其它变量对象
    父级上下文中的活动对象AO
:
{
  data: [...], k
:
  3
}
,
_helper上下文中的活动对象AO: {
  x: 1
}
]
;

data[2].[[Scope]] === [
  ... // 其它变量对象
    父级上下文中的活动对象AO
:
{
  data: [...], k
:
  3
}
,
_helper上下文中的活动对象AO: {
  x: 2
}
]
;
```

## 浅拷贝和深拷贝

### 区别

**浅拷贝**创建一个新的对象，这个对象有着原始对象属性值的一份精确拷贝，如果属性是**基本类型**，拷贝的就是基本类型的**值**，如果是**引用类型**，拷贝的就是**内存地址**。如果其中一个对象改变了这个地址，就会影响到另一个对象。

同理可以推出深拷贝的概念。

### 实现方案

#### JSON版

这是一种比较常用的方法，可以应对大部分的应用场景，但是它还是有很大缺陷的，比如拷贝其他引用类型、拷贝函数、循环引用等情况。

```javascript
let res = JSON.parse(JSON.stringify(value));
```

#### 递归版

```javascript
const clone = (data) => {
  if (typeof data === "object") {
    let res = Array.isArray(target) ? [] : {};
    for (let k in data) {
      if (data.hasOwnProperty(k)) {
        res[k] = clone(data[k]);
      }
    }
    return res;
  } else {
    return data;
  }
}
```

#### 循环引用问题

请看下面的代码：

```javascript
const dataToCopy = {
  name: "yzl"
}

dataToCopy.dataToCopy = dataToCopy;

console.log(dataToCopy); // <ref *1> { name: 'yzl', dataToCopy: [Circular *1] }
```

很明显。我们造成了一个**循环引用**。如果我们对`dataToCopy`执行递归操作，那么它将陷入死循环。

![](http://cdn.yuzzl.top/blog/20201101225823.png)

如何解决循环引用？我们可以使用`Map`这种数据结构来检测某个对象有没有被拷贝过。

请看下面代码：

```javascript
const clone = (data, map = new Map()) => {
  if (typeof data === "object") {
    let res = Array.isArray(data) ? [] : {};
    if (map.get(data)) {
      return map.get(data);
    }
    map.set(data, res);
    for (let k in data) {
      if (data.hasOwnProperty(k)) {
        res[k] = clone(data[k]);
      }
    }
    return res;
  } else {
    return data;
  }
}
```

整个过程描述如下：

- 判断`data`的类型，如果不是`object`，直接返回`data`。

- 判断`data`是否为数组，如果是数组将返回的容器设为`[]`

- 判断`map`中该对象是否存在 -- 是否被拷贝过，如果有，我们直接返回之，反之我们在`Map`里保存它，然后执行遍历递归操作。

#### 性能优化

##### 使用WeakMap

如果我们要拷贝的对象非常庞大时，使用`Map`会对内存造成非常大的额外消耗，而且我们需要手动清除`Map`的属性才能释放这块内存，而`WeakMap`会帮我们巧妙化解这个问题。

关于`WeakMap`的内容请参阅上面的内容。

##### 遍历的方式

首先给出几个遍历方案的效率统计：

- for 与 do while

- forEach map every (这3个不相上下,可认为运行速度差不多)

- for in

我们可以改写上面的`for in`循环为普通的`for`循环：

```javascript
const forEach = (array, iteratee) => {
  let index = -1;
  const length = array.length;
  while (++index < length) {
    iteratee(array[index], index);
  }
}

const clone = (data, map = new Map()) => {
  if (typeof data === "object") {
    const isArray = Array.isArray(data);
    let res = isArray ? [] : {};
    if (map.get(data)) {
      return map.get(data);
    }
    map.set(data, res);

    const keys = isArray ? undefined : Object.keys(data);

    forEach(keys || data, (value, key) => {
      if (keys) {
        key = value;
      }
      res[key] = clone(data[key], map);
    })
    return res;
  } else {
    return data;
  }
}
```

#### 更多的数据类型

##### 一些可遍历的类型

```javascript
// 克隆set
if (type === setTag) {
  target.forEach(value => {
    cloneTarget.add(clone(value, map));
  });
  return cloneTarget;
}

// 克隆map
if (type === mapTag) {
  target.forEach((value, key) => {
    cloneTarget.set(key, clone(value, map));
  });
  return cloneTarget;
}
```

##### 不可遍历的类型

`Bool`、`Number`、`String`、`String`、`Date`、`Error`这几种类型我们都可以直接用构造函数和原始数据创建一个新对象。

例如：

```javascript
// Symbol类型
function cloneSymbol(target) {
  return Object(Symbol.prototype.valueOf.call(target));
}

// 正则
function cloneReg(target) {
  const reFlags = /\w*$/;
  const result = new target.constructor(target.source, reFlags.exec(target));
  result.lastIndex = target.lastIndex;
  return result;
}

// Bool类型
function getCopyObj(target) {
  const Ctor = target.constructor;
  return new Ctor();
}
```

##### 克隆函数

```javascript
function cloneFunction(func) {
  const bodyReg = /(?<={)(.|\n)+(?=})/m;
  const paramReg = /(?<=\().+(?=\)\s+{)/;
  const funcString = func.toString();
  if (func.prototype) {
    console.log('普通函数');
    const param = paramReg.exec(funcString);
    const body = bodyReg.exec(funcString);
    if (body) {
      console.log('匹配到函数体：', body[0]);
      if (param) {
        const paramArr = param[0].split(',');
        console.log('匹配到参数：', paramArr);
        return new Function(...paramArr, body[0]);
      } else {
        return new Function(body[0]);
      }
    } else {
      return null;
    }
  } else {
    return eval(funcString);
  }
}
```

## 原型、原型链

### 实现方式

每个函数都会创建一个 `prototype` 属性，这个属性是一个对象，包含应该由特定引用类型的实例共享的属性和方法。

我们先回顾一下构造函数方法的对象创建：

```javascript
function Person(name, age, job) {
  this.name = name;
  this.age = age;
  this.job = job;
  this.sayName = function () {
    console.log(this.name);
  };
}

let person1 = new Person("Nicholas", 29, "Software Engineer");
let person2 = new Person("Nicholas", 29, "Software Engineer");
console.log(person1.sayName === person2.sayName);
```

与构造函数模式不同，使用原型模式定义的属性和方法是由**所有实例共享**的, 请看下面代码：

```javascript
// 原型方法
function Person() {
}

Person.prototype.name = "Nicholas";
Person.prototype.age = 29;
Person.prototype.job = "Software Engineer";
Person.prototype.sayName = function () {
  console.log(this.name);
};

Person.prototype.addAge = function () {
  this.age++;
}

let person1 = new Person();
person1.sayName(); // Nicholas
console.log(person1.age);  // 29
let person2 = new Person();
console.log(person2.age); // 29
person1.addAge();
console.log(person1.age); // 30
console.log(person2.age); // 29
console.log(person1.sayName === person2.sayName); // true
```

所有属性和`sayName()`方法都直接添加到了`Person` 的 `prototype` 属性上，构造函数体中什么也没有。但这样定义之后，调用构造函数创建的新对象仍然拥有相应的属性和方法。

### 理解原型

无论何时，只要创建一个函数，就会按照特定的规则为这个函数创建一个`prototype`属性（指向原型对象）。

默认情况下，所有原型对象自动获得一个名为`constructor`的属性，指回与之关联的构造函数。

例如下面的代码：

```javascript
function Person() {
}

let person1 = new Person();
let person2 = new Person();

debugger
```

使用调试工具查看：

![](http://cdn.yuzzl.top/blog/20201101225851.png)

每次调用构造函数创建一个新实例，这个实例的内部`[[Prototype]]`指针就会被赋值为**构造函数的原型对象**。脚本中没有访问这个`[[Prototype]]`特性的标准方式， 但主流的浏览器、`nodejs`
会在每个对象上暴露`__proto__`属性，通过这个属性可以访问对象的原型。

请看下图：

![](http://cdn.yuzzl.top/blog/20201101225909.png)

也就是说，实例与**构造函数原型**之间**有直接的联系**，但实例与构造函数之间没有。

另外，同一个函数的两个实例**共享一个原型对象**。

![](http://cdn.yuzzl.top/blog/20201101225928.png)

总结一下上面的描述，可用下图来表示：

![](http://cdn.yuzzl.top/blog/20201101225942.png)

#### 关于原型的一些API

##### Object.getPrototypeOf()

ECMAScript 的 Object 类型有一个方法叫 `Object.getPrototypeOf()`，返回参数的内部特性
`[[Prototype]]`的值 。

例如, 下面的代码会输出`true`：

```javascript
function Person() {
}

Person.prototype.myTest = function () {
  console.log("Hello World");
}

let person1 = new Person();
let person2 = new Person();

console.log(Object.getPrototypeOf(person1) === Person.prototype);
```

##### isPrototypeOf()

可以使用 `isPrototypeOf()`方法确定构造函数A原型是否为实例B的原型：

```javascript
let res = A.prototype.isPrototypeOf(B);
```

例如，下面的代码会输出`true`：

```javascript
function Person() {
}

Person.prototype.myTest = function () {
  console.log("Hello World");
}

let person1 = new Person();
let person2 = new Person();

console.log(Person.prototype.isPrototypeOf(person1));
```

##### setPrototypeOf()

`Object`类型还有一个`setPrototypeOf()`方法，可以向实例的私有特性`[[Prototype]]`写入一个新值。这样就可以重写一个对象的原型继承关系。

```javascript
let biped = {
  numLegs: 2
};
let person = {
  name: 'Matt'
};
Object.setPrototypeOf(person, biped);
console.log(person.name); // Matt
console.log(person.numLegs); // 2
console.log(Object.getPrototypeOf(person) === biped); // true
```

> 关于本API的警告（摘自 developer.mozilla.org）：
>
> 由于现代 JavaScript 引擎优化属性访问所带来的特性的关系，更改对象的 `[[Prototype]]`在各个浏览器和 JavaScript 引擎上都是一个很慢的操作。其在更改继承的性能上的影响是微妙而又广泛的，这不仅仅限于 `obj.__proto__ = ...` 语句上的时间花费，而且可能会延伸到任何代码，那些可以访问任何`[[Prototype]]`已被更改的对象的代码。如果你关心性能，你应该避免设置一个对象的 `[[Prototype]]`。相反，你应该使用 `Object.create()`来创建带有你想要的`[[Prototype]]`的新对象。

##### Object.create()

`Object.create()`方法创建一个新对象，使用现有的对象来提供新创建的对象的`__proto__`

```javascript
let biped = {
  numLegs: 2
};
let person = Object.create(biped);
person.name = 'Matt';
console.log(person.name); // Matt
console.log(person.numLegs); // 2
console.log(Object.getPrototypeOf(person) === biped); // true
```

### 原型层级

在通过对象访问属性时，我们按照如下的规则对属性进行搜索：

- 对象实例本身
- 沿着指针进入原型对象

请看下面代码：

```javascript
function Person() {
}

Person.userId = 666;
Person.prototype.userName = "hello";
Person.prototype.hobby = "coding";


let user = new Person();
user.hobby = "basketball";

console.log(user.userId); // undefined
console.log(user.userName); // hello
console.log(user.hobby); // basketball
```

- 第一个`undefined`的原因前面我们重点说过，实例与**构造函数原型**之间**有直接的联系**，但实例与构造函数之间没有。
- 对于`userName`属性，我们先在对象实例本身下查找，发现没有找到，然后沿着指针进入**原型对象**，找到了它的值。
- 对于`hobby`属性，我们在对象实例本身下查找，发现存在，直接返回对应的值。

## Promise A+ 规范

`Promise`实际上是一个JavaScript的开发标准。

### 手写一个Promise

下面我们结合**Promise A+规范**，来手撕一个`Promise`。

#### 代码

```javascript
class Promise {
  // 待处理
  static PENDING = "PENDING";
  // 已完成
  static FULFILLED = "FULFILLED";
  // 拒绝
  static REJECTED = "REJECTED"
  //尽快执行
  static SET_TIMEOUT_CONFIG = 0;

  constructor(executor) {
    this.status = Promise.PENDING;

    // `value`是任何可能的JavaScript合法对象，包括`undefined`、`thenable`、`promise`。
    this.value = undefined;
    // `reason`表示了为什么Promise会被拒绝
    this.reason = undefined;

    // 成功回调
    this.onResolvedCallbacks = [];
    // 失败回调
    this.onRejectedCallbacks = [];

    // resolve 被执行时，Promise状态由 PENDING 变成 FULFILLED
    // 尽量使用箭头函数，否则外界调用时 this 为 window
    const resolve = (value) => {
      if (this.status === Promise.PENDING) {
        this.value = value;
        this.status = Promise.FULFILLED;
        this.onResolvedCallbacks.forEach((fn) => fn());
      }
    }

    // reject 被执行时，Promise状态由 PENDING 变成 REJECTED
    const reject = (reason) => {
      if (this.status === Promise.PENDING) {
        this.reason = reason;
        this.status = Promise.REJECTED;
        this.onRejectedCallbacks.forEach((fn) => fn());
      }
    }

    // 执行
    try {
      executor(resolve, reject);
    } catch (e) {
      // 执行时错误
      reject(e);
    }
  }

  then(onFulfilled, onRejected) {
    onFulfilled = typeof onFulfilled === "function" ? onFulfilled : value => value;
    onRejected = typeof onRejected === "function" ? onRejected : err => {
      throw err;
    };
    let promise2 = new Promise((resolve, reject) => {
      // 处理同步
      if (this.status === Promise.FULFILLED) {
        setTimeout(() => {
          try {
            let x = onFulfilled(this.value);
            Promise.resolvePromise(promise2, x, resolve, reject);
          } catch (e) {
            reject(e);
          }
        }, Promise.SET_TIMEOUT_CONFIG);
      }

      if (this.status === Promise.REJECTED) {
        setTimeout(() => {
          try {
            let x = onRejected(this.reason);
            Promise.resolvePromise(promise2, x, resolve, reject);
          } catch (e) {
            reject(e);
          }
        }, Promise.SET_TIMEOUT_CONFIG);
      }

      // 处理异步
      if (this.status === Promise.PENDING) {
        // 保存回调，将成功和失败的回调分开存储 异步订阅
        this.onResolvedCallbacks.push(() => {
          setTimeout(() => {
            try {
              let x = onFulfilled(this.value);
              Promise.resolvePromise(promise2, x, resolve, reject);
            } catch (e) {
              reject(e);
            }
          }, Promise.SET_TIMEOUT_CONFIG);
        });

        // 失败回调
        this.onRejectedCallbacks.push(() => {
          setTimeout(() => {
            try {
              let x = onRejected(this.reason);
              Promise.resolvePromise(promise2, x, resolve, reject);
            } catch (e) {
              reject(e);
            }
          }, Promise.SET_TIMEOUT_CONFIG);
        })
      }
    });
    return promise2;
  }

  finally(callback) {
    return this.then((data) => {
      return Promise.resolve(callback()).then(() => data);
    }, (err) => {
      return Promise.resolve(callback().then(() => {
        throw err;
      }))
    });
  }

  static resolvePromise(promise, x, resolve, reject) {
    // 防止等待自身
    if (promise === x) {
      return reject(new TypeError("Chaining cycle detected"));
    }
    let called = false;
    if (typeof x === 'function' || (typeof x === 'object' && x !== null)) {
      try {
        let then = x.then;
        if (typeof then === "function") {
          then.call(x, (y) => {
            if (called) {
              return;
            }
            called = true;
            this.resolvePromise(promise, y, resolve, reject);// promise 的 resolve
          }, (r) => {
            if (called) {
              return;
            }
            called = true;
            reject(r);  // promise 的 reject
          })

        } else {
          resolve(x);
        }
      } catch (e) {
        // promise 失败了
        if (called) {
          return;
        }
        called = true;
        reject(e);
      }
    } else {
      resolve(x);
    }
  };

  static resolve(value) {
    return new Promise((resolve, reject) => {
      resolve(value);
    })
  }

  static reject(value) {
    return new Promise((resolve, reject) => {
      reject(value);
    })
  }

  static isPromise(value) {
    if (typeof value === 'function' || (typeof value === 'object' && value !== null)) {
      if (typeof value.then === "function") {
        return true;
      }
    }
    return false;
  }

  static all(values) {
    return new Promise((resolve, reject) => {
      let arr = [];
      let i = 0;

      let processData = (key, value) => {
        arr[key] = value; // after函数
        if (++i === values.length) {
          resolve(arr);
        }
      }
      for (let i = 0; i < values.length; i++) {
        let current = values[i];
        if (Promise.isPromise(current)) {
          current.then((data) => {
            processData(i, data);
          }, reject);
        } else {
          processData(i, current);
        }
      }
    })
  }
}
```

## let var 和 const

### let和window

var 声明的变量会**被挂载到window**下，请看下面代码：

```javascript
for (var p = 0; p < 10; p++) {
  console.log("hello");
}
console.log(window.p); // 10
```

### 声明提升

请看下面代码：

```javascript
function foo() {
  console.log(age);
  var age = 26;
}

foo();
```

执行`foo`不会报错，因为ECMAScript 运行时把它看成等价于如下代码:

```javascript
function foo() {
  var age;
  console.log(age);
  age = 26;
}

foo();
```

### 作用域

let声明的是**块级作用域**，var声明的是**函数作用域**，请看下面代码, 我们可以打印出`name`

```javascript
if (true) {
  var name = 'Matt';
  console.log(name); // Matt
}
console.log(name); // Mat
```

但是如果使用`let`

```javascript
if (true) {
  let age = 26;
  console.log(age); // 26
}
console.log(age); // ReferenceError: age 没有定义
```

### 冗余声明

**let/const**不允许冗余声明。

```javascript
var a = 100;
console.log(a); // 100
var a = 10;
console.log(a); // 10

let a = 100;
let a = 10; // 报错：Identifier 'a' has already been declared
```

### 实践 -- 用var实现let

```javascript
// 下面的代码会输出
// 2
// 2
// 这是由于var的特性所导致的，具体原因可以看一下作用域链的部分
let myFunction = [];
for (var i = 0; i < 2; i++) {
  myFunction[i] = function () {
    console.log(i);
  }
}
myFunction[0]();
myFunction[1]();
```

```javascript
// 下面，不允许使用let, 实现预期输入
// 0
// 1

let myFunction2 = [];
for (var i = 0; i < 2; i++) {
  let tmp = function () {
    var t = i;
    myFunction2[i] = function () {
      console.log(t);
    }
  };
  tmp();
}
myFunction2[0]();
myFunction2[1]();
```
