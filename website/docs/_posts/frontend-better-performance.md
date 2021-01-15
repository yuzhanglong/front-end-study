---
date: 2020-12-22

tags:

- 性能优化

---

# 谈谈前端性能优化

之前我写过一篇文章，主要是面向 React 框架的性能优化，实际上，面向浏览器、资源请求也可以作出很多的优化，本文对这些方案作了总结。

[[toc]]

## 合理利用缓存

第一部分我们聊聊**缓存**，这是前后端一个很重要的知识点。缓存可以减少冗余传输、减少带宽、降低源服务器的压力。

缓存的工作机制如下：

- 浏览器先根据这个资源的 http 头信息来判断是否命中强缓存。如果命中则直接加在缓存中的资源，并不会将请求发送到服务器。
- 如果未命中强缓存，则浏览器会将资源加载请求发送到服务器。服务器来判断浏览器本地缓存是否失效。若可以使用，则服务器并不会返回资源信息，浏览器继续从缓存加载资源。
- 如果未命中协商缓存，则服务器会将完整的资源返回给浏览器，浏览器加载新资源，并更新缓存。

一图以蔽之：

<a data-fancybox title="" href="http://cdn.yuzzl.top/blog/20201221142823.png">![](http://cdn.yuzzl.top/blog/20201221142823.png)</a>

### 强制缓存

强制缓存的状态码为 200，要实现强制缓存，需要依靠这些请求头：

**Cache-Control**，这个头的可能值如下：

- `private` 客户端可以缓存
- `public` 客户端和代理服务器都可以缓存
- `max-age=x` 缓存内容将在 x 秒后失效
- `no-cache` 需要使用对比缓存验证数据, 强制向源服务器再次验证 (没有强制缓存)
- `no-store` 所有内容都不会缓存，强制缓存和对比缓存都不会触发 (不缓存)

**Expires**，一个时间戳，表示在此时候之后，响应过期。

:::tip

如果在 Cache-Control 响应头设置了 `max-age` 或者 `s-max-age` 指令，那么 `Expires` 头会被忽略。

Cache-Control 中的 `max-age=x` 和 `Expires` 的值有所区别 --- 一个是相对时间、一个是绝对时间。

:::

### 协商缓存

协商缓存的状态码为 304（3xx 属于重定向，这没毛病 -- 重定向到本地的缓存），要想实现协商缓存，需要依赖下面这些请求/响应头：

**ETag**

`ETag` 用来标示资源是否改变。

例如：服务器产生 ETag，并在 HTTP 响应头中将其传送到客户端，服务器用它来判断页面是否被修改过，如果未修改返回 304，无需传输整个对象。

**If-None-Match**

和 `Etag` 匹配的请求头，客户端接收到 `ETag` 之后，下次可以通过这个请求头来发送它，服务端可以通过比较来决定是否需要缓存。

**Last-Modified**

包含源头服务器认定的资源做出修改的日期及时间。它通常被用作一个验证器来判断接收到的或者存储的资源是否彼此一致。

**If-Modified-Since**

和 `Last-Modified` 匹配的请求头，客户端会发送上一次的 `Last-Modified`，服务端通过判断时间来决定是否返回 304。

### 实践 -- 强制缓存和协商缓存

**Last-Modified + If-Modified-Since**

下面的代码利用 **Last-Modified** 和 **If-Modified-Since** 来实现协商缓存，**Last-Modified** 是服务端返回的，可以是当前时间，下次浏览器请求这个资源时就会把这个
**Last-Modified** 交给服务端，让服务端来进行验证。

<a data-fancybox title="" href="http://cdn.yuzzl.top/blog/20201120195300.png">![](http://cdn.yuzzl.top/blog/20201120195300.png)</a>

**ETag + If-None-Match**

下面的代码利用 **ETag + If-None-Match** 实现缓存，服务端将文件计算 hash 值放入 Etag 返回，下次用户再次访问时 If-None-Match 会携带这个ETag，服务端将新的文件计算
hash，然后对比来判断是否 304。

<a data-fancybox title="" href="http://cdn.yuzzl.top/blog/20201120200552.png">![](http://cdn.yuzzl.top/blog/20201120200552.png)</a>

## 优化资源的编码/大小

如果缓存是“获取速度快”，那么优化编码就是“拿得尽可能少”。

就拿图片来说，将一个较大尺寸的图片后添加到页面的较小一块区域，显示部分还是那么大，但是我们下载的图片还是那个 “大尺寸的大小”。浪费了流量并损害了页面性能。

### 图片自适应

我们按照不同宽度准备好几张照片，达到**为不同设备加载不同图片**的目的，这便是响应式图片（图片自适应）。针对这种需求，我们使用 h5 的 `<img>` 标签新特性 **srcset** 和 **sizes**。

例如：

```html
<img srcset="img1.jpg 320w,
             img2.jpg 800w"
     sizes="(max-width: 480px) 440px,
            800px"
     src="img.jpg" alt="hello world">
```

上面的代码中，`srcset` 表示**图像集**，`sizes`。

`sizes` 表示**媒体条件**：如果浏览器视窗宽度为 `440px`，那么 `(max-width: 480px)` 的媒体条件为真，图片的宽度限制为 `440px`，其余条件图片的宽度限制为 `800px`。

`srcset` 表示**图像集**，当 `<img>` 的宽度为 `320w` 时，加载 `img1.jpg`，如果为 `800w`，加载 `img2.jpg`。`w` 和屏幕的密度密切相关，如果屏幕密度为 2，图片尺寸为 `440px`
，则宽度为 `880w`。最终我们加载 `img2.jpg`

:::tip

除了 IE 浏览器，主流浏览器均已兼容此功能。
:::

### 代码压缩

按需加载代码：

- 使用代码拆分将 JavaScript 分解成关键部分和非关键部分。我们可以使用**webpack**等工具实现。
- 延迟加载非关键代码。（懒加载）

例如：

```html
<!-- test-->
<html lang="">
  <head>
    <style>
      /* awesome-container is only used on the landing page */
      .awesome-container {
        font-size: 120%
      }

      .awesome-container {
        width: 50%
      }
    </style>
  </head>

  <body>
    <!-- awesome container content: START -->
    <div>…</div>
    <!-- awesome container content: END -->
    <script>
      awesomeAnalytics(); // beacon conversion metrics
    </script>
  </body>
</html>
```

对于上面的代码，我们可以：

- 直接删除注释可显著减小网页的总大小。
- 可以将将两个 `awesome-container` 选择器声明折叠为一个而不影响任何其他样式，从而节省更多字节。
- 空白（空格和制表符）能够在 HTML、CSS 和 JavaScript 中给开发者提供方便。但是生产环境下体积会变大，我们可以增加一个压缩程序来去掉所有制表符和空格。

### GZIP 压缩

说到资源的大小优化，一个经典的案例便是**GZIP**。这是一种用来改进 web 应用程序性能的技术，web服务器和客户端（浏览器）必须共同支持 gzip。目前主流的浏览器，Chrome, firefox, IE
等都支持该协议。常见的服务器如 Apache，Nginx，IIS 同样支持 gzip。

gzip压缩比率在 3 到 10 倍左右，可以大大节省服务器的网络带宽。

**工作流程**

下图是 gzip 的工作流程：

<a data-fancybox title="" href="http://cdn.yuzzl.top/blog/20201101225138.png">![](http://cdn.yuzzl.top/blog/20201101225138.png)</a>

- 浏览器请求url，并在request header中设置属性 `accept-encoding:gzip`。表明浏览器支持 gzip，例如下图：

<a data-fancybox title="" href="http://cdn.yuzzl.top/blog/20201101225226.png">![](http://cdn.yuzzl.top/blog/20201101225226.png)</a>

- 服务器收到浏览器发送的请求之后，判断浏览器是否支持 gzip，如果支持 gzip，则向浏览器传送压缩过的内容，不支持则向浏览器发送未经压缩的内容。如果支持，response
  headers返回 `content-encoding:gzip`

<a data-fancybox title="" href="http://cdn.yuzzl.top/blog/20201101225238.png">![](http://cdn.yuzzl.top/blog/20201101225238.png)</a>

- 浏览器接收到服务器的响应之后判断内容是否被压缩，如果被压缩则解压缩并显示页面内容。

**实践：NGINX 与 GZIP**

下面是一个 nginx 配置，是本人部署的一个真实案例。

```nginx configuration
#  File: nginx.conf
#  Description: 项目nginx配置文件
#  Created: 2020-8-27 20:10:33
#  Author: yuzhanglong
#  Email: yuzl1123@163.com

server{
    # 端口号
    listen       80;

    # 网站文件根目录
    root  /home/web/build;

    # 开启gzip压缩
    gzip on;
    gzip_min_length 1k;
    gzip_buffers 4 16k;
    gzip_comp_level 2;
    gzip_types text/plain application/javascript application/x-javascript text/css application/xml text/javascript application/x-httpd-php image/jpeg image/gif image/png;
    
    # 支持browser路由
    location / {
        try_files $uri $uri/  /index.html;
    }
}
```

### 衡量 JavaScript 脚本

可以使用 `<script>` 标签的 `async` 和 `defer`：

**defer** 意为“推迟”，在浏览器中体现为**立即下载脚本但推迟执行**。

```html
<!DOCTYPE html>
<html>
  <head>
    <title>Example HTML Page</title>
    <script defer src="example1.js"></script>
    <script defer src="example2.js"></script>
  </head>
  <body>
    <!-- 这里是页面内容 -->
  </body>
</html>
```

defer 是有序的，它会自上而下按顺序执行。

defer 的**加载**会在 `DOMContentLoaded` 事件之前执行。

**async** 意为“异步”，来看下面代码：

```html
<!DOCTYPE html>
<html>
  <head>
    <title>Example HTML Page</title>
    <script async src="example1.js"></script>
    <script async src="example2.js"></script>
  </head>
  <body>
    <!-- 这里是页面内容 -->
  </body>
</html>
```

标记为 `async` 的脚本并不保证能按照它们出现的次序执行，但保证会在页面的 `load` 事件前执行。

这里我想到了一个前端模块化库 -- **require.js**。它就是利用 `async` 来实现模块化的。由于 `async` 保证在 `load` 之前执行完成，所以模块的加载顺序就不成问题。有兴趣的可以去了解一下它的原理。

## 面向浏览器的优化

浏览器是前端代码的主要载体，如何针对浏览器的一些机制来进行优化就显得非常重要。所以我们需要理解浏览器是如何显示网页的。

### 浏览器如何显示网页？

浏览器如何渲染一个网页？主要分为以下步骤：

**DOM树的生成**

当渲染进程接收 HTML 数据时，**主线程**开始解析 HTML 并将其转换为文档对象模型（DOM）。

当遇到外链时，会单独开启一个下载线程去下载资源。

CSS下载是异步的，不会阻塞浏览器构建DOM树，但它会阻塞渲染，也就是在构建渲染树时，会等到 css 下载解析完毕后才进行，这是为了防止css规则不断改变，避免了重复的构建。 对于 JS 也是一个道理，当 HTML

对于 ` <script>` 脚本，会暂停解析 HTML 文档，开始加载、解析并执行 JavaScript 代码。因为 JavaScript 可以使用 `document.write()` 的方法来改写文档，这会改变整个 DOM 结构。

遇到图片等资源时，异步下载，不会阻塞解析，下载完毕后直接用图片**替换**其应该所处的位置即可。

**CSS 规则树的生成**

主线程解析 CSS 并确定每个 DOM 节点计算后的样式。

**布局**

现在，渲染进程知道每个节点的样式和文档的结构，但这不足以渲染页面。

布局是计算元素几何形状的过程。**主线程**遍历计算样式后的 DOM 树，计算样式并创建**布局树（渲染树）**，其中包含 x 、y 坐标和边界框大小等信息。

布局树（渲染树）可能与 DOM 树结构类似，但它仅包含页面上**可见内容**相关的信息。

例如，下面的这些css元素不是布局树的一部分：

```css
#element {
  display: none;
}

p::before {
  content: "Hi!"
}
```

:::tip

利用 `visibility` 和 `opacity` 隐藏的节点，还是会显示在渲染树上的。只有 `display:none` 的节点才不会显示在渲染树上。
:::

**绘制**

拥有 DOM、样式和布局仍然不足以渲染页面。假设你正在尝试重现一幅画。你知道元素的大小、形状和位置，但你仍需要判断绘制它们的顺序。

在绘制步骤中，**主线程**遍历**布局树**创建绘制记录。绘制记录可以看成是绘图过程的记录。

下面总结一下全过程：

<a data-fancybox title="" href="http://cdn.yuzzl.top/blog/20201031201457.png">![](http://cdn.yuzzl.top/blog/20201031201457.png)</a>

网页载入时，上述过程（至少）会执行一次，但是某些操作会导致网页重新渲染，即重新生成布局和重新绘制。前者叫做"重排"（`reflow`），后者叫做"重绘"（`repaint`）。

结合上面的描述，我们不难得出以下结论：

- 要想提高性能，就是要降低"重排"和"重绘"的频率和范围。
- 重排必然导致重绘。
- 布局改变（例如改变宽高、元素位置）会导致重排，而一些颜色的改变会导致重绘。

浏览器对一些 DOM 操作行为做了一些优化，可能导致多次重新渲染的操作会被**队列化**，结合到一起：

```javascript
// 理论上一次重绘 + 一次重排（很明显包括重绘了），但浏览器只会触发一次重排和重绘
div.style.color = 'blue';
div.style.marginTop = '30px';
```

但有些操作会强制刷新队列，引起重绘：

```
offsetTop、offsetLeft、offsetWidth、offsetHeight
scrollTop、scrollLeft、scrollWidth、scrollHeight
clientTop、clientLeft、clientWidth、clientHeight
getComputedStyle()
getBoundingClientRect
```

这些操作会强制队列刷新，如果要利用他们，尽量将值缓存起来。

总结一下，主要有下面这些方案：

- 在过程中尽可能**缓存**一些布局信息。
- 使用**文档片段**（`fragement`），它存在于内存中，并不在DOM树中，所以将子元素插入到文档片段时不会引起页面回流（对元素位置和几何上的计算）。
  因此，使用文档片段通常会带来更好的性能。可参考[MDN 的相关介绍](https://developer.mozilla.org/zh-CN/docs/Web/API/Document/createDocumentFragment)。
- 注意样式的修改，不要一条一条地修改，而是一起修改或者改变类名。
- **利用 display 属性**，上面提到，`display:none` 不会进入布局树。如果对某个元素有大量的 DOM 操作，我们可以先为其css属性为 `display:none`，然后再进行操作，操作完成再恢复，
  这样只会触发**两次渲染**。
- 使用一些基于**虚拟 DOM** 的前端开发框架，例如 vue、React。
- 优化 JavaScript 执行，例如 `window.requestAnimationFrame()`，我们接下来会讲到这一部分。

### 优化 JavaScript 执行

首先得知晓一个名词：屏幕刷新率，一秒之间能够完成多少次重新渲染，这个指标就被称为"刷新率"（FPS）。大多数设备为 60 次/秒。

如果在页面中有一个动画或渐变效果，或者用户正在滚动页面，那么浏览器渲染动画或页面的每一帧的速率也**需要跟设备屏幕的刷新率保持一致**。其中每个帧的预算时间为 (1 秒/ 60 = 16.66 毫秒)。

实际上，浏览器有额外工作要做，因此您的所有工作需要在 10 毫秒内完成。如果无法符合此预算，帧率将下降，并且内容会在屏幕上抖动。 此现象通常称为卡顿，会对用户体验产生负面影响。

每一帧的工作流程如下所示：

<a data-fancybox title="" href="http://cdn.yuzzl.top/blog/frame-full.jpg">![](http://cdn.yuzzl.top/blog/frame-full.jpg)</a>

我们上面一直在说减少重排、重绘，用类似的图来表达就是这样，这是我们最期望的效果：

<a data-fancybox title="" href="http://cdn.yuzzl.top/blog/frame-no-layout-paint.jpg">![](http://cdn.yuzzl.top/blog/frame-no-layout-paint.jpg)</a>

**Style** 指样式计算。此过程是根据匹配选择器计算出哪些元素应用哪些 CSS 规则的过程，这个过程不仅包括计算层叠样式表中的权重来确定样式，也包括内联的样式，来计算每个元素的最终样式。
**Composite** 指合成。由于页面的各部分可能被绘制到多个层上，因此它们需要按正确顺序绘制到屏幕上，才能正确地渲染页面。

#### 使用 requestAnimationFrame 执行动画

为什么要用它？使用 `setTimeout()` 不好吗？事实上，JS 的执行会**阻止渲染**（js 主线程和渲染线程是互斥的），请看下图来理解：

图中 `Frame` 代表一帧，但是 `js` 的执行让某些帧无法执行，导致丢帧，在用户面前体现为卡顿

<a data-fancybox title="" href="http://cdn.yuzzl.top/blog/pagejank2.png">![](http://cdn.yuzzl.top/blog/pagejank2.png)</a>

于是我们使用 `requestAnimationFrame()` 来解决这个问题，它的原理实在每一次重绘前执行相应的 js 代码，来达到下图的理想状态：

<a data-fancybox title="" href="http://cdn.yuzzl.top/blog/raf.png">![](http://cdn.yuzzl.top/blog/raf.png)</a>

下面的案例来自 [MDN](https://developer.mozilla.org/zh-CN/docs/Web/API/Window/requestAnimationFrame) ：

```javascript
const element = document.getElementById('some-element-you-want-to-animate');
let start;

function step(timestamp) {
  if (start === undefined)
    start = timestamp;
  const elapsed = timestamp - start;

  //这里使用 `Math.min()` 确保元素刚好停在200px的位置。
  element.style.transform = 'translateX(' + Math.min(0.1 * elapsed, 200) + 'px)';

  // 在两秒后停止动画
  if (elapsed < 2000) {
    // 若你想在浏览器下次重绘之前继续更新下一帧动画，
    // 那么回调函数自身必须再次调用 window.requestAnimationFrame()
    window.requestAnimationFrame(step);
  }
}

window.requestAnimationFrame(step);
```

`window.requestAnimationFrame(callback)` 告诉浏览器——你希望执行一个动画，并且要求浏览器在下次重绘之前调用指定的回调函数更新动画，它的执行频率和屏幕刷新次数相匹配。

#### 在 `window.requestIdleCallback()` 执行低优先级的逻辑

`window.requestIdleCallback()` 指定只有当一帧的末尾有空闲时间，才会执行回调函数。从上面的信息可以得知，当前帧的运行时间少于每个帧的预算时间 **16.66 毫秒**时会执行回调。

#### 使用防抖和节流

防抖节流一个常见的对象就是输入处理程序，正如上面所说，频繁执行 js 会导致卡帧，甚至导致额外（且不必要）的布局工作，另外结合其它的业务也会导致额外请求开支（例如请求校验）。

防抖节流都是为了**控制事件触发频率**来实现性能的优化，其原理都依赖 JavaScript 的闭包。 例如输入框，我们希望用户输入**停止**了，再去远程校验，或者是去获取搜索信息，核心思想是**等用户停下来再执行**.

来看下面的防抖（debounce）代码，网页中有一个输入框，用户不断输入内容，如果用户输入停止超过 1 秒则打印 `Input Event`：

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <title>防抖和节流</title>
  </head>
  <body>
    <label>
      <input placeholder="请输入内容...." id="test-input">
    </label>
    <script>
      const debounce = (fn, delay) => {
        let timeout = null;
        return function () {
          if (timeout) {
            clearTimeout(timeout);
          }
          timeout = setTimeout(() => {
            fn.apply(this, arguments);
          }, delay);
        }
      }


      const input = document.getElementById("test-input");
      input.addEventListener("input", debounce((e) => {
        console.log(e);
      }, 1000));

    </script>
  </body>
</html>
```

来看下面的节流（throttle）代码，网页中有一个 div，用户鼠标不断在其中移动，我们监听鼠标的移动，每隔 1s 打印 `Mouse Event`：

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <title>防抖和节流</title>
    <style>
      #test-div {
        width: 100px;
        height: 100px;
        background-color: #409EFF;
      }
    </style>
  </head>
  <body>
    <div id="test-div">
      测试节流
    </div>
    <script>
      // 节流函数
      const throttle = (fn, delay) => {
        let isRunning = true;
        return function () {
          if (!isRunning) {
            return;
          }
          isRunning = false;
          setTimeout(() => {
            fn.apply(this, arguments);
            isRunning = true;
          }, delay);
        }
      }

      const div = document.getElementById("test-div");
      div.addEventListener("mousemove", throttle((e) => {
        console.log(e);
      }, 1000));
    </script>
  </body>
</html>
```

#### 使用 Web Worker

在许多情况下，可以将纯计算工作移到 `Web Worker`，数据操作或遍历（例如排序或搜索）、复杂的加密算法、复杂 canvas 的渲染往往很适合这种模型。

Web Worker 的 API 使用这里不再赘述，[MDN](https://developer.mozilla.org/zh-CN/docs/Web/API/Web_Workers_API/Using_web_workers)
上讲的非常详细且通俗易懂。

## 参考资料

- Paul Lewis，[Rendering Performance](https://developers.google.cn/web/fundamentals/performance/rendering)

- MDN，[requestAnimationFrame](https://developer.mozilla.org/zh-CN/docs/Web/API/Window/requestAnimationFrame)

- MDN，[requestIdleCallback](https://developer.mozilla.org/zh-CN/docs/Web/API/Window/requestIdleCallback)

- Mariko
  Kosaka，[Inside look at modern web browser](https://developers.google.com/web/updates/2018/09/inside-browser-part1)
