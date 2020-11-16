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

这两行代码位于**内部函数**中（是一个匿名函数），引用了**外部函数变量**`propertyName`, 在这个函数被返回并在其它地方被使用时，它仍然引用这那个变量。本质上是**内部函数的作用域链**包含了`createComparisonFunction()`的作用域。

### 上下文和作用域链

如果需要深刻了解闭包，就需要了解上下文和作用域链。

#### 上下文（Context）

变量或函数的上下文决定了它们可以访问哪些数据，以及它们的行为。  例如，`window`对象被称为全局上下文(浏览器环境)。上下文在其所有代码都执行完毕后会被销毁。（例如在浏览器环境下，全局上下文在应用程序退出前才会被销毁，比如关闭网页或退出浏览器）。

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

上下文中的代码在执行的时候，会创建变量对象的一个**作用域链**。这个作用域链决定了各级上下文中的代码在**访问变量和函数时的顺序**。代码正在执行的上下文的变量对象始终位于作用域链的最前端。如果上下文是函数，则其活动对象（activation object）用作变量对象。活动对象最初只有一个定义变量：**arguments**。作用域链中的下一个变量对象来自包含上下文，再下一个对象来自再下一个包含上下文。以此类推直至全局上下文；全局上下文的变量对象始终是作用域链的**最后一个变量对象**。  

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

根据函数创建的算法，我们看到 在ECMAScript中，**所有的函数都是闭包**，因为它们都是在创建的时候就保存了**上层上下文的作用域链**。（不管这个函数后续是否被执行，因为上面提到过，`[[scopes]]`在函数创建的时候就有了）。

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
  父级上下文中的活动对象AO: {data: [...], k: 3},
  _helper上下文中的活动对象AO: {x: 0}
];

data[1].[[Scope]] === [
  ... // 其它变量对象
  父级上下文中的活动对象AO: {data: [...], k: 3},
  _helper上下文中的活动对象AO: {x: 1}
];

data[2].[[Scope]] === [
  ... // 其它变量对象
  父级上下文中的活动对象AO: {data: [...], k: 3},
  _helper上下文中的活动对象AO: {x: 2}
];
```





### 使用场景

#### 一些数组的操作集

```javascript
[1, 2, 3].sort(function (a, b) {
  ... // 排序条件
});
    
[1, 2, 3].map(function (element) {
  return element * 2;
}); // [2, 4, 6]
```

#### 定时器

```javascript
let name = 'Jake';
    setInterval(() => {
    console.log(name);
}, 100);  
```

#### 函数防抖

```JavaScript
/*
* fn [function] 需要防抖的函数
* delay [number] 毫秒，防抖期限值
*/
function debounce(fn,delay){
    let timer = null    //借助闭包
    return function() {
        if(timer){
            clearTimeout(timer) //进入该分支语句，说明当前正在一个计时过程中，并且又触发了相同事件。所以要取消当前的计时，重新开始计时
            timer = setTimeOut(fn,delay) 
        }else{
            timer = setTimeOut(fn,delay) // 进入该分支说明当前并没有在计时，那么就开始一个计时
        }
    }
}
```

## ES6新类型

### Symbol

Symbol（符号）是 ECMAScript 6 新增的数据类型（js中原始数据类型有` string` `number` `boolean` `null` `undefined` `symbol` / `object`）。符号是原始值，且符号实例是唯一、不可变的。符号的用途是确保对象属性使用唯一标识符，不会发生属性冲突的危险。

#### 特点

##### 独一无二

Symbol之间永远不相等。

```javascript
let s1 = Symbol('my'); // 描述这个symbol 内部会将描述符 toString
let s2 = Symbol('my');
console.log(s1 === s2); // false
```

##### 不可枚举性

Symbol是不可以枚举的，例如下面的代码，for循环不会进入循环体。

```javascript
let obj = {
    [s2]:1 // 如果这个属性是用symbol 来声明的，不可枚举
}

for(let key in obj){
    console.log(obj[key]);
}

console.log(Object.getOwnPropertySymbols(obj)); // [ Symbol(my) ]
```

但是，我们可以使用`Object.getOwnPropertySymbols(obj)`这个API来获取。

##### Symbol.for()

```javascript
let s1 = Symbol('my');
// Symbol.for
let s3 = Symbol.for('aaa');
let s4 = Symbol.for('bbb');
let s5 = Symbol.for('aaa');
console.log(s4 === s5); // false
console.log(s3 === s5   // true
```

#### 实践

##### 私有属性

```javascript
// 私有属性
const privateField = Symbol();

class MyClass {
  constructor() {
    this[privateField] = 'hello world';
  }

  getField() {
    return this[privateField];
  }

  setField(val) {
    this[privateField] = val;
  }
}

let myClass = new MyClass();

console.log(myClass.getField());
```

##### 防止属性污染

模拟一个`call`方法：

```javascript
// 私有属性
const privateField = Symbol();

class MyClass {
  constructor() {
    this[privateField] = 'hello world';
  }

  getField() {
    return this[privateField];
  }

  setField(val) {
    this[privateField] = val;
  }
}

// 防止属性污染
Function.prototype.myCall = function (context) {
  // 用于防止 Function.prototype.myCall() 直接调用
  if (typeof this !== 'function') {
    return undefined;
  }
  context = context || global;
  const fn = Symbol();
  context[fn] = this;
  const args = [...arguments].slice(1);
  const result = context[fn](...args);
  delete context[fn];
  return result;
}

let myClass = new MyClass();

console.log(myClass.getField());
console.log(myClass.getField.myCall(myClass));
```

在`vue-router`的源码中也有相关的使用，请看下面代码：

```javascript
export const routerKey = /*#__PURE__*/ PolySymbol(
  __DEV__ ? 'router' : 'r'
) as InjectionKey<Router>

app.provide(routerKey, router)
```

##### 防止XSS攻击

我们都知道，React元素是一个`plain object`:

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
      __html: '/* 把你想的搁着 */'
    },
  },
  // ...
};
let message = { text: expectedTextButGotJSON };
```

然后在某段JSX中使用了它：

```jsx
// React 0.13 中有风险
<p>
  {message.text}
</p>
```

但是React在之后的版本中使用了`Symbol`标记React元素：

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

因为JSON不支持 `Symbol` 类型。**所以即使服务器存在用JSON作为文本返回安全漏洞，JSON 里也不包含 `Symbol.for('react.element')`**。React 会检测 `element.$$typeof`，如果元素丢失或者无效，会拒绝处理该元素。

### WeakMap

#### 介绍

ECMAScript 6 新增的“弱映射”（ WeakMap）是一种新的集合类型，为这门语言带来了增强的键/值对存储机制。 WeakMap 是 Map 的“兄弟”类型，其 API 也是 Map 的子集。 WeakMap 中的“weak”（弱），描述的是 JavaScript 垃圾回收程序对待“弱映射”中键的方式。  

#### 弱键

WeakMap的特点就在于它的**弱映射**。它的键不属于正式的引用，不会阻止垃圾回收。  

```javascript
const wm = new WeakMap();
wm.set({}, "val");
```

`set()`方法初始化了一个新对象并将它用作一个字符串的键。因为**没有指向这个对象的其他引用**，所以当这行代码执行完成后，这个对象键就会被当作垃圾回收。然后，这个键/值对就从弱映射中消失了，使其成为一个空映射。在这个例子中，因为值也没有被引用，所以这对键/值被破坏以后，值本身也会成为垃圾回收的目标。  

```javascript
const wm = new WeakMap();
const container = {
  key: {}
};
wm.set(container.key, "val");

function removeReference() {
  container.key = null;
}
```

这一次， `container` 对象维护着一个对弱映射键的引用，因此这个对象键不会成为垃圾回收的目标。不过，如果调用了 `removeReference()`，就会摧毁键对象的最后一个引用，垃圾回收程序就可以把这个键/值对清理掉。  

#### 实践

##### DOM 节点元数据  

````javascript
const m = new Map();
const loginButton = document.querySelector('#login');
// 给这个节点关联一些元数据
m.set(loginButton, {disabled: true});
````

假设在上面的代码执行后，页面被 JavaScript 改变了，原来的登录按钮从 DOM 树中被删掉了。但由于映射中还保存着按钮的引用，所以对应的 DOM 节点仍然会逗留在内存中，除非明确将其从映射中删除或者等到映射本身被销毁。  

我们使用弱映射,那么当节点从 DOM 树中被删除后，垃圾回收程序就可以**立即释放其内存**（假设没有其他地方引用这个对象）

```javascript
const wm = new WeakMap();
const loginButton = document.querySelector('#login');
// 给这个节点关联一些元数据
wm.set(loginButton, {disabled: true});
```

### 代理和反射

#### 代理模式实践

##### 跟踪属性访问

通过捕获 `get`、 `set` 和 `has` 等操作，可以知道对象属性什么时候被访问、被查询。把实现相应捕获器的某个对象代理放到应用中，可以监控这个对象何时在何处被访问过。（例如埋点统计操作行为）

```javascript
const user = {
  name: 'Jake'
};
const proxy = new Proxy(user, {
  get(target, property, receiver) {
    console.log(`Getting ${property}`);
    return Reflect.get(...arguments);
  },
  set(target, property, value, receiver) {
    console.log(`Setting ${property}=${value}`);
    return Reflect.set(...arguments);
  }
});
// 访问用户名称
console.log(proxy.name);
proxy.age = 10;
console.log(proxy.age);
```

##### 属性隐藏

请看下面的代码，如果用户访问的`key`为`foo`或者`bar`，那么我们会返回一个`undefined`:

```javascript
const hiddenProperties = ['foo', 'bar'];
const targetObject = {
  foo: 1,
  bar: 2,
  baz: 3
};

const proxy = new Proxy(targetObject, {
  get(target, property) {
    if (hiddenProperties.includes(property)) {
      return undefined;
    } else {
      return Reflect.get(...arguments);
    }
  },
  has(target, property) {
    if (hiddenProperties.includes(property)) {
      return false;
    } else {
      return Reflect.has(...arguments);
    }
  }
});
console.log(proxy.foo); // undefined
console.log(proxy.bar); // undefined
console.log(proxy.baz); // 3
// has()
console.log('foo' in proxy); // false
console.log('bar' in proxy); // false
console.log('baz' in proxy); // true
```

##### 作为验证器

所有赋值操作都会触发`set()`捕获器，我们可以根据所赋的值决定是否继续赋值。

下面的代码展示了如果传入的类型为`number`，我们才执行赋值操作。

```javascript
const target = {
  onlyNumbersGoHere: 0
};
const proxy = new Proxy(target, {
  set(target, property, value) {
    if (typeof value !== 'number') {
      return false;
    } else {
      return Reflect.set(...arguments);
    }
  }
});
proxy.onlyNumbersGoHere = 1;
console.log(proxy.onlyNumbersGoHere); // 1
proxy.onlyNumbersGoHere = '2';
console.log(proxy.onlyNumbersGoHere); // 1
```

我们还可以对函数进行参数验证：

```javascript
// 为数组进行排序
const getSortedData = (...numbers) => {
  return numbers.sort();
}

// 数组排序函数监控
const sortFunctionProxy = new Proxy(getSortedData, {
  apply(target, thisArg, argArray) {
    for (let i = 0; i < argArray.length; i++) {
      if (typeof argArray[i] !== "number") {
        throw new Error("请传入数字");
      }
    }
    return Reflect.apply(...arguments);
  }
})

console.log(sortFunctionProxy(...[1, 2, 3, 0, -1])); // [ -1, 0, 1, 2, 3 ]
console.log(sortFunctionProxy(...[1, "2", 3, 0, -1])); // Error: 请传入数字
```

##### 数据绑定与可观察对象  

通过代理可以把运行时中原本不相关的部分联系到一起。这样就可以实现各种模式，从而让不同的
代码互操作。  

```javascript
const userList = [];

class User {
  constructor(name) {
    this.name_ = name;
  }
}

const proxy = new Proxy(User, {
  construct() {
    const newUser = Reflect.construct(...arguments);
    userList.push(newUser);
    return newUser;
  }
});
new proxy('John');
new proxy('Jacob');
new proxy('Jingleheimerschmidt');
console.log(userList); // [User {}, User {}, User{}]
```

## 防抖和节流

函数防抖和节流，都是**控制事件触发频率**的方法。应用场景有很多，输入框持续输入，将输入内容远程校验、多次触发点击事件、onScroll等等。

它们都是利用**setTimeout**和**闭包**来实现的。

### 防抖（debounce）

函数防抖，这里的抖动就是执行的意思，而一般的抖动都是持续的，多次的。假设函数持续多次执行，我们希望让它冷静下来再执行。也就是当**持续触发事件的时候，函数是完全不执行的**，等最后一次触发结束的一段时间之后，再去执行。

#### 实现方案

```javascript
const debounce = (fun, delay) => {
  let t = null;
  return function () {
    clearTimeout(t);
    t = setTimeout(() => {
      fun.apply(arguments);
    }, delay);
  }
}
```

### 节流（throttle）

节流的意思是让函数有节制地执行，而不是毫无节制的触发一次就执行一次。什么叫有节制呢？就是在一段时间内，只执行一次。

#### 实现方案

```javascript
const throttle = (fun, delay) => {
  let isRun = true;
  return function () {
    if (isRun) {
      return;
    }
    isRun = false;
    setTimeout(() => {
      fun.apply(arguments);
      isRun = true;
    }, delay);
  }
}
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
    const result = new targe.constructor(target.source, reFlags.exec(target));
    result.lastIndex = target.lastIndex;
    return result;
}

// Bool类型
function getCopyObj(target){
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

每次调用构造函数创建一个新实例，这个实例的内部`[[Prototype]]`指针就会被赋值为**构造函数的原型对象**。脚本中没有访问这个`[[Prototype]]`特性的标准方式， 但主流的浏览器、`nodejs`会在每个对象上暴露`__proto__`属性，通过这个属性可以访问对象的原型。

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

## JS继承原理

### 前置知识

#### 函数签名

一个函数签名 (或类型签名，或方法签名) 定义了函数或方法的输入与输出。

一个签名可以包括：

- 参数及其类型
- 一个返回值及其类型
- 可能的异常
- 方法可用性的信息（public、static等）

#### 接口继承和实现继承  

很多面向对象语言都支持两种继承：接口继承和实现继承。前者只继承方法签名，后者继承实际的方法。接口继承在 ECMAScript 中是不可能的，因为函数没有签名。实现继承是 ECMAScript 唯一支持的继承方式，而这主要是通过**原型链**实现的。

### 基本继承实现

#### DEMO

下面的代码可以实现一次继承：

```javascript
function SuperType() {
  this.property = true;
}

SuperType.prototype.getSuperValue = function () {
  return this.property;
};

function SubType() {
  this.subproperty = false;
}

// 继承 SuperType
SubType.prototype = new SuperType();
SubType.prototype.getSubValue = function () {
  return this.subproperty;
};
let instance = new SubType();
console.log(instance.getSuperValue());
```

来看看它们之间的关系：

![](http://cdn.yuzzl.top/blog/20201106194345.png)

##### 实现继承的关键

- 我们之前说过，一个对象在创建时会初始化一个`prototype`--默认原型 -- 指向原型对象。

- 但这里的 `SubType` 没有使用默认原型，而是将其替换成了一个新的对象。  

- 所以，`SubType` 的实例不仅能从 `SuperType` 的实例中继承属性和方法，而且还与 `SuperType` 的原型挂上了钩。  

- 我们创建的新实例`instance`的`prototype`指向了`subType`的原型。

#### 方法覆写

```javascript
// 继承 SuperType 忽略了上面的代码
SubType.prototype = new SuperType();
// 新方法
SubType.prototype.getSubValue = function () {
	return this.subproperty;
};
// 覆盖已有的方法
SubType.prototype.getSuperValue = function () {
	return false;
};
```

#### 构造函数盗用

##### 引用问题

来看下面的继承代码，由于引用的原因，新增的实例会出现不期望的结果：

```javascript
function SuperType() {
this.colors = ["red", "blue", "green"];
}
function SubType() {}
// 继承 SuperType
SubType.prototype = new SuperType();
let instance1 = new SubType();
instance1.colors.push("black");
console.log(instance1.colors); // "red,blue,green,black"
let instance2 = new SubType();
console.log(instance2.colors); // "red,blue,green,black"(我们期望的是"red", "blue", "green")
```

##### 解决方案

###### 代码

这个解决方案叫做**盗用构造函数**，又称对象伪装或者**经典继承**。

```javascript
function SuperType() {
  this.colors = ["red", "blue", "green"];
}
function SubType() {
// 继承 SuperType
	SuperType.call(this);
}
let instance1 = new SubType();
instance1.colors.push("black");
console.log(instance1.colors); // "red,blue,green,black"
let instance2 = new SubType();
console.log(instance2.colors); // "red,blue,green"
```
###### 本质
通过使用 `call()`（或 `apply()`）方法， 使SuperType构造函数在为 SubType 的实例创建的新对象的上下文中执行。这相当于新的 SubType 对象上运行了`SuperType()`函数中的所有初始化代码。  

##### 缺陷
```javascript
// 盗用构造函数的缺点
SuperType.prototype.sayHello = function () {
  console.log("hello world");
}
instance1.sayHello();
```
我们可以看到，盗用构造函数无法实现对**父类方法**的调用。

##### 缺陷的本质
这是一般构造函数的原型关系：
![](http://cdn.yuzzl.top/blog/20201107195139.png)
这是盗用构造函数的原型关系：
![](http://cdn.yuzzl.top/blog/20201107195559.png)
我们可以看到，一般构造函数改写原型为**父类的实例**，从而获得父类的所有方法、成员变量，但是盗用构造函数只是在自己的构造函数中执行父类的构造函数。它自己的原型还是默认的--子构造函数的原型。
### 组合继承
组合继承无非是上面两种继承的复合版，不再过多赘述，直接上代码：
``` javascript
// 组合继承
function SuperType(name) {
  this.name = name;
  this.colors = ["red", "blue", "green"];
}

SuperType.prototype.sayName = function () {
  console.log(this.name);
};

function SubType(name, age) {
// 继承属性
  SuperType.call(this, name);
  this.age = age;
}

// 继承方法
SubType.prototype = new SuperType();
SubType.prototype.sayAge = function () {
  console.log(this.age);
};
let instance1 = new SubType("Nicholas", 29);
instance1.colors.push("black");
console.log(instance1.colors); // "red,blue,green,black"
instance1.sayName(); // "Nicholas";
instance1.sayAge(); // 29
let instance2 = new SubType("Greg", 27);
console.log(instance2.colors); // "red,blue,green"
instance2.sayName(); // "Greg";
instance2.sayAge(); // 27
```

### 寄生式继承
来看下面的代码：
``` javascript
// 寄生式继承
// 类似于工厂模式
function CreateAnother(original) {
  // 通过调用函数创建一个新对象
  let clone = Object(original);
  // 以某种方式增强这个对象
  clone.sayHi = function () {
    console.log("hi");
  };
  // 返回这个对象
  return clone;
}

let person = {
  name: "Nicholas",
  friends: ["Shelby", "Court", "Van"]
};
let anotherPerson = CreateAnother(person);
anotherPerson.sayHi();
```
这个例子基于 `person` 对象返回了一个新对象。新返回的 `anotherPerson` 对象具有 `person` 的所有属性和方法，还有一个新方法叫 `sayHi()`。

### 寄生式组合继承
我们之前的组合继承貌似挺不错的，但是你会发现父类的构造函数调用了两次。
如何解决此类问题？来看下面的代码：
```
// 寄生组合式继承
function inheritPrototype(subType, superType) {
  let prototype = Object(superType.prototype); // 创建对象, 使用Object包裹的原因是在堆中新增一个对象，即解除引用的影响
  prototype.constructor = subType; // 增强对象
  subType.prototype = prototype; // 赋值对象
}
function SuperType(name) {
  this.name = name;
  this.colors = ["red", "blue", "green"];
}
SuperType.prototype.sayName = function () {
  console.log(this.name);
};
function SubType(name, age) {
  SuperType.call(this, name);
  this.age = age;
}
inheritPrototype(SubType, SuperType);
SubType.prototype.sayAge = function () {
  console.log(this.age);
};
let i = new SuperType("Jim");
i.sayName();
```
这里解释一下`inheritPrototype`:c传入子类和父类，缓存父类的原型，修改父类的原型的构造函数，然后将这个缓存的原型赋给子类，这时候我们暂时无法执行父类的构造函数，但是我们之前介绍过**盗用构造函数**解决方案来了 -- 利用`call`在子类调用父类的构造函数即可。

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
for(var p = 0; p < 10; p++){
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



## TODO

Proxy和Object.defineProperty()

Object.defineProperty()的缺陷

event loop

浏览器底层（并发）

- 栈溢出
- js 去重
- js 并发请求

事件委托

垃圾回收

工作者线程

