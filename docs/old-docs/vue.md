# Vue

https://zhuanlan.zhihu.com/p/53703176

https://www.bilibili.com/video/BV14k4y117LL

## MVVM

### 概念

**MVVM** 是 **Model-View-ViewModel** 的缩写。是一种设计思想。Model 层代表数据模型，也可以在 Model 中定义数据修改和操作的业务逻辑；View 代表 UI 组件，它负责将数据模型转化成 UI
展现出来，ViewModel 是一个同步 View 和 Model 的对象。

### 和MVC的区别

如果你了解过后端开发，那么你一定知道这三个东西 -- **Model、View、Controller**。

- **Model**：数据模型，用来存储数据
- **View**：视图界面，用来展示UI界面和响应用户交互
- **Controller**：控制器(大管家角色)，监听模型数据的改变和控制视图行为、处理用户交互。

随着项目复杂度的上升，MVC的弊端被展现出来 -- 复杂业务逻辑界面的Controller非常庞大，维护困难。

MVVM主要解决了MVC中**大量的DOM操作**使页面渲染性能降低，加载速度变慢，影响用户体验。和当 Model 频繁发生变化，开发者需要**主动更新**到View层。

## 手写一个MVVM

下面我们来手写一个简陋版的MVVM。

> 注意：下面的所有代码均是为了**体会MVVM思想**来编写的，和我们平常用的vue有很大的差距。

### 一些初始化的工作

我们以`vue`的模板为例子，写出如下的HTML代码：

```html
<!DOCTYPE html>
<html lang="en" xmlns:v-on="http://www.w3.org/1999/xhtml">
  <head>
    <meta charset="UTF-8">
    <title>MVVM STUDY</title>
    <script src="./MVVM.js"></script>
  </head>
  <body>
    <div id="app">
      <label>
        <input type="text" v-model="user.name">
      </label>
      <div>
        <div>{{user.name}}</div>
        <div>{{user.age}}</div>
      </div>
    </div>
    <script>
      let vm = new MVVM({
        el: "#app",
        data: {
          user: {
            name: "yzl",
            age: 20,
          }
        }
      })
    </script>
  </body>
</html>
```

然后写一下我们的MVVM类，把用户的`el`/`data`传入这个类中。

```javascript
class MVVM {
  constructor(options) {
    this.$el = options.el;
    this.$data = options.data;
  }
}
```

### 首先要干什么？

打开我们的这个HTML文件, 可以看到下面的内容：

![](http://cdn.yuzzl.top/blog/20201031195828.png)

很明显，我们要把像`{{user.name}}`/`{{user.age}}`这样的**模板语法**（mustache语法）解析成我们定义的数据（data），这个过程称为**编译**（**Compile**
），接下来，我们编写`Compile`类。

### 编写Compiler类

#### 构造函数

**Compile类**初始化需要什么？

- 首先是我们要操作的**节点**（模板语法都在节点里面）
- MVVM对象，我们要读取用户配置的**data**等属性。

于是我们写出下面的**构造函数（伪代码）**，值得注意的是，这个`el`可能是个节点，也可能是个字符串，我们分类讨论即可。

```javascript
class Compiler {
  constructor(el, vm) {
    // 判断el属性是字符串还是元素,如果是字符串，我们通过它来获取元素
    // 调用 compile 编译旧的节点
    // 将新的节点插入el中
  }

  compile(参数1

：
  要编译的节点
) {
  // TODO: 编译
}
}
```

接下来就是取出这些节点，然后进行一系列操作处理它们，再插入节点，我们知道，每一次插入节点就会引起DOM树的变化，从而触发浏览器的渲染，如果多次重复进行这个操作就会造成性能问题，但是如果我们先把节点处理好，再**一次性插入**
，就会大大提高效率，所以我们需要使用文档碎片 -- **DocumentFragment**，具体的API在这里不再赘述。

所以，我们的构造函数最终为：

```javascript
class Compiler {
  constructor(el, vm) {
    this.el = this.isElementNode(el) ? el : document.querySelector(el);
    this.vm = vm;
    let fragment = this.nodeToFragment(this.el);
    this.compile(fragment);
    this.el.appendChild(fragment);
  }

  compile(node) {
    // TODO: 编译
  }
}
```

#### 初步实现编译功能

##### compile主函数

编译函数传入一个根节点，**递归地遍历、处理每一个元素**。（节点其实是一颗树，对树进行遍历我们当然用递归），我们可以写出如下代码，注意，节点可以是文本。所以我们需要分类讨论，（另外，如果是文本，那么我们也不需要递归处理了）

```javascript
compile(node)
{
  // 获取子节点
  let childNodes = node.childNodes;
  // 遍历子节点
  [...childNodes].forEach(child => {
    // 判断是元素还是文本
    if (this.isElementNode(child)) {
      // 编译节点
      this.compileElement(child);
      // 调用自身，递归处理
      this.compile(child);
    } else {
      this.compileText(child);
    }
  })
}
```

##### 处理文本节点

模板语法都在文本节点里面出现，我们可以利用正则来取出模板，然后进行相应的替换。

```javascript
compileText(node)
{
  // 内容
  let content = node.textContent;
  // 匹配 {{}}
  if (/\{\{(.+?)\}\}/.test(content)) {
    // TODO: 处理content
    CompileUtil['text'](node, content, this.vm);
  }
}
```

为了处理**Content**，我们先创建一个工具类`CompileUtil`,并添加我们的**处理文本**的工具函数。

主要的步骤有：

- 获取大括号里面的内容，例如`{{user.name}}`中的`user.name`。
- 取到内容之后（例如`user.name`），依靠这个字符串来修改节点内容，其中：
    - 首先按每个`.`来分割，然后去vm的`$data`中逐层寻找，最终获得这个值（`getValue()`）
    - 拿到所有的值之后，执行`textUpdater`，更新内容。

```javascript
CompileUtil = {
  text(node, expr, vm) {
    let fn = this.updater['textUpdater'];
    // 正则匹配大括号 注意一串文本中可能有多个mustache语法
    let content = expr.replace(/\{\{(.+?)\}\}/g, (...args) => {
      return this.getValue(vm, args[1]);
    });
    // 将content插入到节点处
    fn(node, content);
  },
  updater: {
    // 处理文本节点
    textUpdater(node, value) {
      node.textContent = value;
    },
  },
  // 从用户传入的 $data 查询相关内容
  getValue(vm, expr) {
    return expr.split(".").reduce((data, current) => {
      return data[current];
    }, vm.$data);
  },
}
```

##### 处理元素节点

举个例子，这是一个`<input>`元素：

```html
<input type="text" v-model="user.name" onclick="xxxx">
```

用过Vue的人都知道，**v-model**称为**指令**，我们需要解析这些指令, 代码如下。

```javascript
compileElement(node)
{
  let attributes = node.attributes;
  [...attributes].forEach(attr => {
    // js解构语法
    let {name, value: expr} = attr;

    // 判断是不是指令
    if (this.isDirective(name)) {
      // 按照横线分割，例如 v-model => v + model
      let [a, directive] = name.split("-");
      // 按照横线分割，例如 v-model => v + model
      let [directiveName, eventName] = directive.split(":");

      // 我们已经获取到指令了！接下来就是按这些指令分类讨论，进行操作，后面会讲到
      CompileUtil[directiveName](node, expr, this.vm, eventName);
    }
  })
}

// 是否为指令 例如 v-xxx
isDirective(attrName)
{
  return attrName.startsWith('v-');
}
```

我们已经获取到指令了！接下来就是按这些指令分类讨论，进行操作，首先我们来学习一下两个重要思想 -- **发布订阅模式**和**数据劫持**。

### 发布订阅模式和数据劫持

#### Observer

既然要实现所谓的双向绑定，那么就需要一个**Observer**来劫持我们的**getter**和**setter**，这样我们在值被修改时做些什么，JavaScript的`Object.defineProperty()`
就是一个很好的材料。

> 提示：ES6的**Proxy**是一个更好的选择，我们在最后会提到。

我们一获取`data`，就需要监听它的每一个属性，所以我们的**Observer**应该在MVVM的构造函数初始化。

#### 发布-订阅模式

每一个被监听的属性都必须具有这样的功能 -- 当它被set时，判断前后两值是否相同，如果不相同，监听新值，并且通知订阅者 -- 我被改变了，请更新内容，这就是所谓**发布订阅模式**。

所以，我们需要一个“**订阅管理器**”来添加订阅者（**Watcher**）、通知订阅者更新，我们命名为**Dep类**，订阅者我们命名为**Watcher类**。

```javascript
class Dep {
  constructor() {
    // 存放所有的观察者
    this.subs = [];
  }

  // 订阅 -- 添加观察者
  addSub(watcher) {
    this.subs.push(watcher);
  }

  // 通知所有观察者 -- 我的值改变了
  notify() {
    this.subs.forEach(watcher => watcher.update());
  }
}
```

```javascript
class Watcher {
  constructor(vm, expr, cb) {
    this.vm = vm;
    this.expr = expr;
    this.cb = cb;
    this.oldValue = this.get();
  }

  get() {
    Dep.target = this;
    let value = CompileUtil.getValue(this.vm, this.expr);
    Dep.target = null;
    return value;
  }

  update() {
    let newValue = CompileUtil.getValue(this.vm, this.expr);
    if (newValue !== this.oldValue) {
      this.cb(newValue);
    }
  }
}
```

#### 流程图解

上面说了那么多，我们可以用这幅图来表示：

![](http://cdn.yuzzl.top/blog/20201101004104.png)

#### 添加Watcher、完成指令处理

##### 对文本节点的处理稍作修改

刚才的处理文本节点，就需要加入Watcher，代码修改为：

```javascript
text(node, expr, vm)
{
  let fn = this.updater['textUpdater'];
  let content = expr.replace(/\{\{(.+?)\}\}/g, (...args) => {
    new Watcher(vm, args[1], () => {
      // 返回完整字符串
      let entireValue = this.getContentValue(vm, expr);
      fn(node, entireValue);
    });
    return this.getValue(vm, args[1]);
  });
  fn(node, content);
}
,
```

一旦值被改变，回调函数会被执行，从而达到view更新的效果。

##### v-html

类似的，**v-html**也是差不多的道理：

```javascript
html(node, expr, vm)
{
  let fn = this.updater['htmlUpdater'];
  new Watcher(vm, expr, (newValue) => {
    fn(node, newValue);
  });
  let value = this.getValue(vm, expr);
  fn(node, value);
}
```

##### v-model

v-model不过是多了一个事假监听功能(这里只考虑input，别的事件如果需要的话，如法炮制即可 -- 使用`addEventListener`这个API)：

```javascript
// node 为节点 expr为表达式 vm为当前实例
model(node, expr, vm)
{
  let fn = this.updater['modelUpdater'];
  // 添加一个观察者, 如果将来数据发生更新，那么会拿新值给输入框赋值
  new Watcher(vm, expr, (newValue) => {
    fn(node, newValue);
  });
  node.addEventListener('input', (e) => {
    let value = e.target.value;
    this.setValue(vm, expr, value);
  })
  let value = this.getValue(vm, expr);
  fn(node, value);
}
,
```

#### 实现methods

我们都知道vue里面有个methods语法：

```javascript
let vm = new MVVM({
  el: "#app",
  data: {
    user: {
      name: "yzl"
    },
  },
  methods: {
    change() {
      this.user.name = "23123";
    }
  }
})
```

我们在MVVM类的构造函数中利用`Object.defineProperty`初始化，当这个方法被取到时，触发get方法（被劫持），执行响应函数，返回执行后的值:

```javascript
class MVVM {
  constructor(options) {
    this.$el = options.el;
    this.$data = options.data;
    let computed = options.computed;
    let methods = options.methods;
    if (this.$el) {
      // 数据使用Object.defineProperty来定义
      new Observer(this.$data);


      for (let key in methods) {
        Object.defineProperty(this, key, {
          get: () => {
            return methods[key];
          }
        })
      }
      this.proxy(this.$data);
      new Compiler(this.$el, this);
    }
  }
}
```

对于computed语法，也是差不多，但是注意this的指向，我们可以使用Object.call来优雅地处理：

```javascript
for (let key in computed) {
  Object.defineProperty(this.$data, key, {
    get: () => {
      return computed[key].call(this);
    }
  })
}
```

#### 代理 $data

我们可以将data**代理到MVVM对象**上，方便调用者取值。

```javascript
proxy(data)
{
  for (let key in data) {
    if (data.hasOwnProperty(key)) {
      Object.defineProperty(this, key, {
        get() {
          return data[key];
        },
        set(value) {
          data[key] = value;
        }
      });
    }
  }
}
```

#### 最终代码

##### HTML

```html
<!DOCTYPE html>
<html lang="en" xmlns:v-on="http://www.w3.org/1999/xhtml">
  <head>
    <meta charset="UTF-8">
    <title>Title</title>
    <script src="./MVVM.js"></script>
  </head>
  <body>
    <div id="app">
      <label>
        <input type="text" v-model="user.name">
      </label>
      <button v-on:click="change">hello</button>
      <div>
        <div>{{user.name}}</div>
        <div>{{user.age}}</div>
        <div>{{user.hobby}}</div>
        <div>{{myTest}}</div>
        <div v-html="html"></div>
      </div>
    </div>

    <script>
      let vm = new MVVM({
        el: "#app",
        data: {
          user: {
            name: "yzl",
            age: 20,
            hobby: "coding"
          },
          html: '<h1>hello world</h1>'
        },
        computed: {
          myTest() {
            return this.user.name + "test";
          }
        },
        methods: {
          change() {
            this.user.name = "23123";
          }
        }
      })
    </script>
  </body>

</html>
```

##### JavaScript

```javascript
class Compiler {
  constructor(el, vm) {
    // 判断el属性是字符串还是元素,
    // 如果是字符串，我们通过它来获取元素
    this.el = this.isElementNode(el) ? el : document.querySelector(el);
    this.vm = vm;

    let fragment = this.nodeToFragment(this.el);
    this.compile(fragment);
    this.el.appendChild(fragment);
  }

  // 编译内存中的DOM节点
  compile(node) {
    let childNodes = node.childNodes;
    [...childNodes].forEach(child => {
      if (this.isElementNode(child)) {
        this.compileElement(child);
        this.compile(child);
      } else {
        this.compileText(child);
      }
    })
  }

  // 是否为指令 例如 v-xxx
  isDirective(attrName) {
    return attrName.startsWith('v-');
  }

  // 编译元素
  compileElement(node) {
    let attributes = node.attributes;
    [...attributes].forEach(attr => {
      let {name, value: expr} = attr;
      // 判断是不是指令
      if (this.isDirective(name)) {
        let [a, directive] = name.split("-");
        let [directiveName, eventName] = directive.split(":");
        CompileUtil[directiveName](node, expr, this.vm, eventName);
      }
    })
  }

  // 编译文本
  compileText(node) {
    let content = node.textContent;
    if (/\{\{(.+?)\}\}/.test(content)) {
      // 找到文本
      CompileUtil['text'](node, content, this.vm);
    }
  }

  // 是否为html元素节点
  isElementNode(node) {
    return node.nodeType === 1;
  }

  nodeToFragment(node) {
    let fragment = document.createDocumentFragment();
    let firstChild = node.firstChild;
    while (firstChild) {
      fragment.appendChild(firstChild);
      firstChild = node.firstChild;
    }
    return fragment;
  }
}

CompileUtil = {
  // 根据表达式取到对应的数据
  getValue(vm, expr) {
    return expr.split(".").reduce((data, current) => {
      return data[current];
    }, vm.$data);
  },

  setValue(vm, expr, value) {
    expr.split(".").reduce((data, current, index, arr) => {
      if (arr.length - 1 === index) {
        return data[current] = value;
      }
      return data[current];
    }, vm.$data);
  },

  // node 为节点 expr为表达式 vm为当前实例
  model(node, expr, vm) {
    let fn = this.updater['modelUpdater'];
    // 添加一个观察者, 如果将来数据发生更新，那么会拿新值给输入框赋值
    new Watcher(vm, expr, (newValue) => {
      fn(node, newValue);
    });
    node.addEventListener('input', (e) => {
      let value = e.target.value;
      this.setValue(vm, expr, value);
    })
    let value = this.getValue(vm, expr);
    fn(node, value);
  },
  html(node, expr, vm) {
    let fn = this.updater['htmlUpdater'];
    new Watcher(vm, expr, (newValue) => {
      fn(node, newValue);
    });
    let value = this.getValue(vm, expr);
    fn(node, value);
  },
  getContentValue(vm, expr) {
    // 遍历表达式 将内容重新替换成一个完整的内容
    return expr.replace(/\{\{(.+?)\}\}/g, (...args) => {
      return this.getValue(vm, args[1]);
    })
  },

  on(node, expr, vm, eventName) {
    node.addEventListener(eventName, (e) => {
      vm[expr].call(vm, e);
    });
  },
  text(node, expr, vm) {
    let fn = this.updater['textUpdater'];
    let content = expr.replace(/\{\{(.+?)\}\}/g, (...args) => {
      new Watcher(vm, args[1], () => {
        // 返回完整字符串
        let entireValue = this.getContentValue(vm, expr);
        fn(node, entireValue);
      });
      return this.getValue(vm, args[1]);
    });
    fn(node, content);
  },
  updater: {
    // 把数据插入到节点中
    modelUpdater(node, value) {
      node.value = value;
    },
    // 处理文本节点
    textUpdater(node, value) {
      node.textContent = value;
    },
    htmlUpdater(node, value) {
      node.innerHTML = value;
    }
  }
}

class Dep {
  constructor() {
    // 存放所有的观察者
    this.subs = [];
  }

  // 订阅 -- 添加观察者
  addSub(watcher) {
    this.subs.push(watcher);
  }

  notify() {
    this.subs.forEach(watcher => watcher.update());
  }
}

Dep.target = null;

class Watcher {
  constructor(vm, expr, cb) {
    this.vm = vm;
    this.expr = expr;
    this.cb = cb;
    this.oldValue = this.get();
  }

  get() {
    Dep.target = this;
    let value = CompileUtil.getValue(this.vm, this.expr);
    Dep.target = null;
    return value;
  }

  update() {
    let newValue = CompileUtil.getValue(this.vm, this.expr);
    if (newValue !== this.oldValue) {
      this.cb(newValue);
    }
  }
}

// 数据劫持
class Observer {
  constructor(data) {
    this.observer(data);
  }

  observer(data) {
    if (data && typeof data == "object") {
      for (let key in data) {
        if (data.hasOwnProperty(key)) {
          this.defineReactive(data, key, data[key]);
        }
      }
    }
  }

  defineReactive(obj, key, value) {
    this.observer(value);
    // 给每一个属性都加上一个具有发布订阅的功能
    let dep = new Dep();
    Object.defineProperty(obj, key, {
      get: () => {
        // 创建watcher时 会取到对应的内容 watcher放到了全局上
        Dep.target && dep.addSub(Dep.target);
        return value;
      },
      set: (newValue) => {
        if (value !== newValue) {
          // 如果赋值了新的对象，那么我们也要设置监听。
          this.observer(newValue);
          value = newValue;
          dep.notify();
        }
      }
    });
  }
}

class MVVM {
  constructor(options) {
    this.$el = options.el;
    this.$data = options.data;
    let computed = options.computed;
    let methods = options.methods;
    if (this.$el) {
      // 数据使用Object.defineProperty来定义
      new Observer(this.$data);

      for (let key in computed) {
        Object.defineProperty(this.$data, key, {
          get: () => {
            return computed[key].call(this);
          }
        })
      }

      for (let key in methods) {
        Object.defineProperty(this, key, {
          get: () => {
            return methods[key];
          }
        })
      }
      this.proxy(this.$data);
      new Compiler(this.$el, this);
    }
  }

  // 代理
  proxy(data) {
    for (let key in data) {
      if (data.hasOwnProperty(key)) {
        Object.defineProperty(this, key, {
          get() {
            return data[key];
          },
          set(value) {
            data[key] = value;
          }
        });
      }
    }
  }
}
```

## Vue3.0特性

#### DIFF算法优化

vue2的虚拟DOM是**全量的对比**。

例如下面的HTML节点：

```html

<div>
  <p>passage</p>
  <p>{{message}}</p>
</div>
```

对应的虚拟DOM树：

![](http://cdn.yuzzl.top/blog/20201101233800.png)

当message更新时，我们遍历这颗树，逐一对比，然后做出更新。

很明显，写死的数据`passage`永远不会变化，进行比较将是多余的。

在Vue3.0中，我们使用**静态标记**，谁有标记就比较谁。

![](http://cdn.yuzzl.top/blog/20201101234706.png)

![](http://cdn.yuzzl.top/blog/20201102133131.png)

#### 静态提升（hoistStatic）

- **vue2**中无论元素是否参与更新，每次都会重新创建并渲染。

- **vue3**中对于不参与更新的元素会进行**静态提升**，**只会被创建一次**，在渲染时**直接复用**即可。

![](http://cdn.yuzzl.top/blog/20201102134357.png)

![](http://cdn.yuzzl.top/blog/20201102133734.png)

#### 事件侦听器缓存(cacheHandlers)

默认情况下onClick会被视为动态绑定，我们每次都会追踪它的变化。

但是由于是同一个函数，是不会有变化的，所以我们直接**缓存起来复用**即可。

![](http://cdn.yuzzl.top/blog/20201102134637.png)

![](http://cdn.yuzzl.top/blog/20201102134807.png)

#### 组合式 API (Composition API)

组合式API的使用和React的**hooks**非常像，它们都可以用来抽离重复的业务逻辑。

##### 经典分页案例

组合API的优势通常在一些重复的业务逻辑上体现，例如web开发少不了分页请求，来看下面接口的返回内容：

![](http://cdn.yuzzl.top/blog/20201103235224.png)

想想我们以前怎么做的 -- 在vue组件中写一个`methods`来请求数据，然后再将这些数据赋值到`data`，然后如果一个项目有几十个分页请求，重复的业务逻辑就会让人捉襟见肘。

来看看我们的组合式API如何处理：

**usePagination.js**

```javascript
import { reactive } from "docs/old-docs/vue";

export const usePagination = (requestMethod, params) => {
  let state = reactive({
    data: {
      items: [],
      page: 0,
      total: 0,
      totalPage: 0,
      count: 0
    }
  });
  let changeCurrentPage = async () => {
    try {
      const response = await requestMethod(params);
      console.log(response);
      state.data = response.data;
      console.log(state);
    } catch (e) {
      //TODO: 异常处理
      console.log(e);
    }
  }
  return {
    state,
    changeCurrentPage
  }
}
```

**App.vue**

我们用`settimeout`来模拟网络请求。

```javascript
<template>
  <div>
    <p>{{pagination}}</p>
    <button
    @click="pagination.changeCurrentPage">改变页码
  </button>
</div>
</template>

<script>
  import {usePagination} from "./Composable/usePagination";

  export default {
  name: 'App',
  setup() {
  const testPromise = () => {
  return new Promise((resolve) => {
  setTimeout(() => {
  resolve({
  "code": "00000", "message": "success", "request": null, "data": {
  "total": 13,
  "count": 15,
  "page": 0,
  "totalPage": 1,
  "items": [
{
  "id": 10011,
  "name": "最大连续和",
  "characterTags": ["DP"],
  "createTime": 1599539054591,
  "closed": false
}, {
  "id": 10012,
  "name": "字符串匹配",
  "characterTags": ["测试"],
  "createTime": 1596104002325,
  "closed": false
}
  ]
}
});
}, 1000);
})
}
  let pagination = usePagination(testPromise, {});
  return {
  pagination
}
},
}
</script>
```

我们只需要点击一下按钮，就可以做到自动换页（需要额外传入目标页码，这里省略了），并且无需再写网络请求代码，同时视图层做到了刷新，一行代码做到了上面的所有目标，并且我们的`usePagination.js`在任何组件中都可以使用。

#### 响应性API

##### ref()和reactive()

`ref` 和 `reactive` 这两个API都是为了给JavaScript普通的数据类型赋予**响应式特性(reactivity）**。

`ref()`接受一个内部值并返回一个**响应式**且可变的 ref 对象，通过执行`ref.value`可以获取值。

下面是一个简单的计数器案例：

```vue

<template>
  <div>
    <p>{{ count }}</p>
    <button @click="add">hello</button>
  </div>
</template>

<script>
import {ref} from "vue";

export default {
  name: 'App',
  components: {},
  setup() {
    // 设置初始值为0
    let count = ref(0);
    const add = () => {
      count.value++;
    }
    return {count, add};
  }
}
</script>
```

`reactive()`同样返回对象的响应式副本。只不过它不能直接包装普通类型。

```javascript
<template>
  <div>
    <p>{{count.value}}</p>
    <button
    @click="count.add()">hello
  </button>
</div>
</template>

<script>
  import {reactive} from "vue";

  export default {
  name: 'App',
  components: {},
  setup() {
  // 设置初始值为0
  let count = reactive({
  value: 123,
  add: () => {
  count.value++;
}
});
  return {count};
}
}
</script>
```

##### Reactive的本质

###### 它是用Proxy包装的

`reactive`的本质是使用了`proxy`进行包装，（关于proxy的语法在这里不再赘述，具体内容可以前往JavaScript篇的**代理与反射**一探究竟），我们可以打印`count`来看一下：

![](http://cdn.yuzzl.top/blog/20201102181235.png)

从Vue的源码中我们也可以看出来（重点关注红色方框中的内容）：

![](http://cdn.yuzzl.top/blog/20201102181416.png)

###### 它和data”殊途同归“

还是前面的案例，我们在生命周期的`mounted()`中打印一下`this`：

![](http://cdn.yuzzl.top/blog/20201102184303.png)

我们可以看到我们定义的`count`，它的表现形式和`data`一模一样，都是`proxy`封装的一个对象。

##### 递归监听和非递归监听

###### 递归监听

请看下面代码：

```vue

<template>
  <div>
    <p>{{ state.name }}</p>
    <p>{{ state.father.name }}</p>
    <p>{{ state.father.father.name }}</p>
    <button @click="test">hello</button>
  </div>
</template>

<script>
import {reactive} from "vue";

export default {
  name: 'App',
  components: {},
  setup() {
    let state = reactive({
      name: "son",
      father: {
        name: "father",
        father: {
          name: "grandfather"
        }
      }
    });
    const test = () => {
      state.father.father.name = "grandfather2";
      console.log(state);
      console.log(state.father);
      console.log(state.father.father);
    }
    return {state, test};
  },
}
</script>
```

当我们点击屏幕上的**Hello2**按钮时，**grandfather**变成了**grandfather2**。然后我们看看控制台打印的内容：

![](http://cdn.yuzzl.top/blog/20201102203236.png)

vue为每一个元素封装了`proxy`，也就是说它使用了**递归监听** -- 递归遍历reactive包裹的对象，将每个对象绑定上`proxy`，对于一些数据量比较大的情况势必会消耗性能。

###### 非递归监听 -- shallowReactive()

shallow意为“浅的”。它创建一个响应式代理，该代理跟踪其自身 property 的响应性，但不执行嵌套对象的深度响应式转换 (暴露原始值)。

我们将上面代码的`reactive` 换成`shallowReactive`，然后看看控制台：

![](http://cdn.yuzzl.top/blog/20201102203948.png)

可以看到，`shallowReactive`只为**根元素**添加了代理，其它的都是普通的对象。

由此我们可以推断出，只有**对根元素**的修改才会引起视图层的变化：

**未对根元素修改**

![](http://cdn.yuzzl.top/blog/20201102204720.png)

**对根元素修改**

![](http://cdn.yuzzl.top/blog/20201102204901.png)

而且你会发现，如果我们对根元素修改之后修改了子元素，那么子元素也会同时被修改。

##### toRow()

`toRow()`返回代理的原始对象。

假设有这样一个场景，我们需要对`reactive`包裹的内容进行一些加工、计算，会修改值，但是我们不希望这些值的修改在视图层上体现。

如下图，点击按钮，视图不会变化。

![](http://cdn.yuzzl.top/blog/20201103001132.png)
