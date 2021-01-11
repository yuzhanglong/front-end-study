# AMD 案例

## 概述

- AMD是Asynchronous Module Definition（异步模块定义）的缩写
- 它采用的是**异步加载**模块
- AMD 现在使用的比较少

## 基本原理阐述

AMD 是用来解决 common.js 同步阻塞的问题。AMD 的基本原理依赖下面的几点：

- HTML5 为<script>元素定义了 async 属性，利用这个属性来告诉浏览器，不必等脚本下载和执行完后再加载页面，同样也不必等到 该异步脚本下载和执行后再加载其他脚本。

- 异步脚本保证会在页面的 load 事件前执行。

在 `require.js` 中，通过向 DOM 中插入 `script` 标签实现目的：

![](http://cdn.yuzzl.top/blog/20201208220524.png)

但是异步加载必然会出现一个问题 -- 加载顺序。 如果你的模块存在依赖关系，那么这必然是致命的。 前面说过，异步脚本保证会在页面的 load
事件前执行。也就是说，等到所有模块加载完了再来加载，我们如果能够在模块加载完成之后再来执行回调就不会出现问题。

require.js 源码中将加载完成的回调绑定在 `window.onload` 事件上：

```javascript
node.addEventListener('load', context.onScriptLoad, false);
```
