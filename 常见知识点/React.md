# React

## JSX本质

#### 它是React.CreateElement()的语法糖

JSX是`React.CreateElement()`的语法糖，来看看官网对这个API的解释：

![](http://cdn.yuzzl.top/blog/20201107101507.png)

来看看下面的代码，`data`/`data2`效果是一样的，可以解释上面的结论：

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <title>Title</title>
    <script crossorigin src="https://unpkg.com/react@16/umd/react.development.js"></script>
    <script crossorigin src="https://unpkg.com/react-dom@16/umd/react-dom.development.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/babel-standalone@6.26.0/babel.min.js"></script>
  </head>
  <body>
    <div id="app"></div>
    <script type="text/babel">
      const data = <h2>hello world</h2>;
      const data2 = React.createElement("h2", null, "hello world 2");
      ReactDOM.render(data2, document.getElementById("app"));
    </script>
  </body>
</html>
```

#### Babel在其中的作用

babel是个JavaScript编译器，我们都知道，**原生JS**是不可以直接解析下面的代码的：

```jsx
const data = <h2>hello world</h2>;
```

使用Babel就可以解析，我们可以使用官网的DEMO来验证我们的观点。

![](http://cdn.yuzzl.top/blog/20201107135043.png)

可以看到，我们的JSX语法被解析成了`React.CreateElement()`，同样印证了我们的结论。

#### React.CreateElement()

它需要三个参数`type`/`config`/`children`，分别表示**当前React元素的类型**/**jsx的属性**/**存放在标签里面的内容**，最终返回一个`ReactElement`对象(树) -- 也就是所谓的**虚拟DOM**。

![](http://cdn.yuzzl.top/blog/20201107135536.png)

值得注意的是，我们传入了四个参数，这和前面的三个参数有点矛盾。这是一个巧妙的地方，来看源码(位于` packages/react/src/ReactElement.js`)：

```javascript
// packages/react/src/ReactElement.js
const childrenLength = arguments.length - 2;
  if (childrenLength === 1) {
    props.children = children;
  } else if (childrenLength > 1) {
    const childArray = Array(childrenLength);
    for (let i = 0; i < childrenLength; i++) {
      childArray[i] = arguments[i + 2];
    }
    if (__DEV__) {
      if (Object.freeze) {
        Object.freeze(childArray);
      }
    }
    props.children = childArray;
  }
```

很明显，他使用了`arguments`这个默认属性，来处理多参数的问题，孩子大于1时，创建了一个数组，遍历传入的孩子，加入数组，赋给孩子。

## 虚拟DOM

### 概念

我们上面介绍过了`React.CreateElement()`这个API，它的创建结果是什么。来看这张图片：

![](http://cdn.yuzzl.top/blog/20201107144745.png)

可以看到我们生成了一颗JavaScript的对象树 -- 它就是所谓的**虚拟DOM（Virtual DOM）**，至此，我们可以看出React渲染的基本过程：

- JSX语法间接调用`createElement`。
- `createElement`返回`ReactElement`对象树。
- `ReactDOM.render`映射到真实DOM。

### 优点

为什么采用虚拟DOM：

- 难以跟踪状态的改变。
- 操作真实DOM性能较低。

