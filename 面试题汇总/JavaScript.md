# JavaScript

https://zhuanlan.zhihu.com/p/72923073

http://www.conardli.top/blog/article/JS%E8%BF%9B%E9%98%B6/%E5%A6%82%E4%BD%95%E5%86%99%E5%87%BA%E4%B8%80%E4%B8%AA%E6%83%8A%E8%89%B3%E9%9D%A2%E8%AF%95%E5%AE%98%E7%9A%84%E6%B7%B1%E6%8B%B7%E8%B4%9D.html#%E5%BE%AA%E7%8E%AF%E5%BC%95%E7%94%A8

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

![image-20201021211232862](C:\Users\yuzhanglong\AppData\Roaming\Typora\typora-user-images\image-20201021211232862.png)

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

![image-20201021212817381](C:\Users\yuzhanglong\AppData\Roaming\Typora\typora-user-images\image-20201021212817381.png)

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

![image-20201021213229580](C:\Users\yuzhanglong\AppData\Roaming\Typora\typora-user-images\image-20201021213229580.png)

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

![image-20201021234525185](C:\Users\yuzhanglong\AppData\Roaming\Typora\typora-user-images\image-20201021234525185.png)

### 闭包的深入理解

#### 闭包的本质

从上面的解释中我们不难得到闭包的本质：**内部函数的作用域链**包含了**外部函数的作用域**。

#### 值得注意的地方

##### 所有的函数都是闭包

根据函数创建的算法，我们看到 在ECMAScript中，**所有的函数都是闭包**，因为它们都是在创建的时候就保存了**上层上下文的作用域链**。（不管这个函数后续是否被执行，因为上面提到过，**[[scopes]]**在函数创建的时候就有了）。

##### 所有对象都引用一个[[scopes]]

在ECMAScript中，同一个父上下文中创建的闭包是**共用一个[[scopes]]属性**的。也就是说，某个闭包对其中[[scopes]]的变量做修改会影响到其他闭包对其变量的读取。

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

我们使用弱映射,那么当节点从 DOM 树中被删除后，垃圾回收程序就可以立即释放其内存（假设没有其他地方引用这个对象）

```javascript
const wm = new WeakMap();
const loginButton = document.querySelector('#login');
// 给这个节点关联一些元数据
wm.set(loginButton, {disabled: true});
```





## 防抖和节流

函数防抖和节流，都是**控制事件触发频率**的方法。应用场景有很多，输入框持续输入，将输入内容远程校验、多次触发点击事件、onScroll等等。

它们都是利用`setTimeou`t和`闭包`来实现的。

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

![image-20201023212433460](C:\Users\yuzhanglong\AppData\Roaming\Typora\typora-user-images\image-20201023212433460.png)

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

