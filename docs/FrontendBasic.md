# 前端基础

https://zhuanlan.zhihu.com/p/24764131
https://mp.weixin.qq.com/s/6Cc5RMw3pAHEUM58KLB-MQ
https://developers.google.com/web/fundamentals/performance/optimizing-content-efficiency/optimize-encoding-and-transfer?hl=zh-cn

https://developers.google.com/web/fundamentals/performance/optimizing-content-efficiency/eliminate-downloads?hl=zh-cn

https://developers.google.com/web/fundamentals/performance/optimizing-content-efficiency/javascript-startup-optimization?hl=zh-cn

https://github.com/chenjigeng/blog/issues/4

https://developer.mozilla.org/zh-CN/docs/Learn/HTML/Multimedia_and_embedding/Responsive_images

https://segmentfault.com/a/1190000022398875

https://www.zhihu.com/question/66629910/answer/273992383

## 跨域方案

### 跨源资源共享(CORS)

#### 总述

通过 **XHR** 进行 **Ajax 通信**的一个主要限制是跨源安全策略。默认情况下， XHR 只能访问与发起请求的页面在同一个域内的资源。这个安全限制可以防止某些恶意行为。

#### CORS

跨源资源共享（ CORS， Cross-Origin Resource Sharing）定义了浏览器与服务器如何实现跨源通信。CORS 背后的基本思路就是使用自定义的 HTTP
头部允许浏览器和服务器相互了解，以确实请求或响应应该成功还是失败。

请求在发送时会有一个额外的头部**Origin**，如下面所示：

```http
Origin: http://docs.yuzzl.top
```

它包括了**协议**、**域名**、**端口**，以便服务器确定是否提供响应。

如果服务器**决定响应请求**，那么它也会发送一个头部：

```http
Access-Control-Allow-Origin: http://docs.yuzzl.top
```

如果资源是公开的，那么可以如此做:

```http
Access-Control-Allow-Origin: *
```

如果没有这个头部，或者有但源不匹配，则表明不会响应浏览器请求。否则，服务器就会处理这个请求。

#### 预检请求

CORS 通过一种叫**预检请求**（ preflighted request）的服务器验证机制，允许使用自定义头部、除 GET 、 POST、HEAD（这三个也被称为**简单请求**）
之外的方法，以及不同请求体内容类型。在要发送涉及上述某种高级选项的请求时，会先向服务器发送一个“预检”请求。这个请求使用 OPTIONS 方法发送并包含以下头部。

- **Origin**：与简单请求相同

- **Access-Control-Request-Method**：请求希望使用的方法

- **Access-Control-Request-Headers**：（可选）要使用的逗号分隔的自定义头部列表。

例如下面的请求报文(省略了一部分无关头部)：

```http
OPTIONS /user/user_info HTTP/1.1
Host: 47.106.202.255:8081
Connection: keep-alive
Accept: */*
Access-Control-Request-Method: GET
Access-Control-Request-Headers: authorization,loading
Origin: http://oj.yuzzl.top
```

在这个请求发送之后，服务器确认是否允许，然后在响应头部附带以下内容：

- **Access-Control-Allow-Origin**：与简单请求相同。
- **Access-Control-Allow-Methods**：允许的**方法**（逗号分隔的列表）。
- **Access-Control-Allow-Headers**：服务器允许的**头部**（逗号分隔的列表）。
- **Access-Control-Max-Age**：**缓存**预检请求的秒数。

例如下面的响应报文(省略了一部分无关头部)：

```http
Access-Control-Allow-Credentials: true
Access-Control-Allow-Headers: authorization, loading
Access-Control-Allow-Methods: POST,GET,PUT,OPTIONS,DELETE
Access-Control-Allow-Origin: http://docs.yuzzl.top
Access-Control-Max-Age: 3600
```

我们可以发现，预检请求也是有缓存机制的。

#### 凭据请求

默认情况下，跨源请求不提供凭据（ cookie、 HTTP 认证和客户端 SSL 证书）。可以通过将withCredentials 属性设置为 true 来表明请求会发送凭据。如果服务器允许带凭据的请求，那么可以在响应中包含如下 HTTP
头部：

```http
Access-Control-Allow-Credentials: true
```

假如我们发送了凭据请求但是响应没有这个头部，那么浏览器**不会将响应交给JavaScript调用**。（在XMLHTTPRequest的接口层面显示为 `status=0`，调用`onerror()`）

### 图片探测

通过`<img>`标签来实现跨域通信，例如：

```javascript
let img = new Image();
img.onload = img.onerror = function() {
  alert("Done!");
};
img.src = "http://www.example.com/test?name=Nicholas";
```

图片探测频繁用于跟踪用户在页面上的点击操作或动态显示广告。当然它只能发送GET请求并且无法获取服务器的响应。

### JSONP

#### 介绍

**JSONP** 是“JSON with padding”的简写，是在 Web 服务上流行的一种 JSON 变体。

JSONP 是通过动态创建`<script>`元素并为 src 属性指定跨域 URL 实现的。

- JSONP 是从不同的域拉取可执行代码。如果这个域并不可信，则可能在响应中加入恶意内容。 此时除了完全删除 JSONP 没有其他办法。在使用不受控的 Web 服务时，一定要保证是可以信任的。
- 不好确定 JSONP 请求是否失败。虽然 HTML5 规定了`<script>`元素的 `onerror` 事件处理程序，但还没有被任何浏览器实现。为此，开发者经常使用计时器来决定是否放弃等待响应。
- JSONP不支持**POST**请求跨域。
- 当你使用 **IE<=9, Opera<12, or Firefox<3.5** 或者更加老的浏览器，这个时候请使用 JSONP。

#### 实践

下面是我从网上找到的一个JSONP API，用来获取本地天气。

```http
https://query.asilu.com/weather/baidu?callback=handleResponse
```

```html
<!DOCTYPE html>
<html lang='en'>
  <head>
    <meta charset='UTF-8'>
    <title>JSONP测试</title>
  </head>
  <body>
    <script>
      const handleResponse = (response) => {
        console.log(response);
      }

      let script = document.createElement("script");
      script.src = "https://query.asilu.com/weather/baidu?callback=handleResponse";
      document.body.appendChild(script);
    </script>
  </body>
</html>

```

上面的代码执行后，往**body**中插入了一个`<script>`标签，于是我们可以调用第三方接口，注意我们传入的query:**callback=handleResponse**，服务端会返回一个这样的文本：

```javascript
handleResponse({ "city": "杭州", "pm25": "66", "weather": ["数组的内容被省略了"] });
```

这下更明白JSONP实现的原理了吧，浏览器获取这串代码（js脚本），就会直接`handleResponse()` -- 也就是我们之前定义的：

```javascript
const handleResponse = (response) => {
  console.log(response);
}
```

最终，浏览器控制台打印了我们想要的JSON数据：

![](http://cdn.yuzzl.top/blog/20201101205643.png)

### 正向代理

我们可以利用服务端请求不会跨域的特性，让接口和当前站点同域。

#### 描述

##### 代理前

![](http://cdn.yuzzl.top/blog/20201103085044.png)

##### 代理后

![](http://cdn.yuzzl.top/blog/20201103085156.png)

#### 实践

##### VueCLI

```javascript
module.exports = {
  devServer: {
    port: 8000,
    proxy: {
      "/api": {
        target: "http://localhost:8080"
      }
    }
  }
};
```

##### webpack

```javascript
const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = {
  entry: {
    index: "./basic_redux.js"
  },
  output: {
    filename: "bundle.js",
    path: path.resolve(__dirname, "dist")
  },
  devServer: {
    port: 8000,
    proxy: {
      "/api": {
        target: "http://localhost:8080"
      }
    }
  },
  plugins: [
    new HtmlWebpackPlugin({
      filename: "index.html",
      template: "webpack.html"
    })
  ]
};
```

### nginx反向代理

#### 描述

![](http://cdn.yuzzl.top/blog/20201103085830.png)

本质上是配置了一个转发：

```nginx
server {
        listen 80;
        location /api {
            proxy_pass http://localhost:8080;
        }
        location / {
            proxy_pass http://localhost:8000;
        }
}
```

### PostMessage

#### 总述

**postMessage**是**html5**引入的API,`postMessage()`
方法允许来自不同源的脚本采用异步方式进行有效的通信,可以实现跨文本文档,多窗口,跨域消息传递.多用于窗口间数据通信,这也使它成为跨域通信的一种有效的解决方案。

#### 实践

我们现在有两个域，一个是本地域，还有一个是远程服务器（当然你也可以都在本地运行，只要确保他们不同源即可），其中：

- 本地IP：`http://localhost:63342`

- 远程IP：`http://182.254.197.28`

##### 本地HTML

```html
<!DOCTYPE html>
<html lang='en'>
  <head>
    <meta charset='utf-8'>
    <meta http-equiv='X-UA-Compatible' content='IE=edge'>
    <title>POST MESSAGE -- 本地</title>
  </head>
  <body>
    <h4>主页面</h4>
    <iframe id='iframe' src='http://182.254.197.28/'></iframe>
    <script>
      const iframe = document.getElementById('iframe');
      iframe.onload = () => {
        const data = {
          name: 'yzl',
          age: 20
        };
        // 向domain2传送跨域数据
        iframe.contentWindow.postMessage(JSON.stringify(data), 'http://182.254.197.28/');
      };
      window.addEventListener('message', (e) => {
        console.log('本地接收到数据: ' + e.data);
      }, false);
    </script>
  </body>
</html>

```

- 注意本地HTML中的`iframe`，它相当于在页面中**新增了一个窗口**，小窗口和窗口外是**跨域**的：

![](http://cdn.yuzzl.top/blog/20201106111357.png)

- onload钩子 -- 在小窗口加载完成时，向其发送消息，接下来我们来看看**小窗口的HTML**。

##### 远程HTML

```html
<!doctype html>
<html lang='en'>
  <head>
    <meta charset='utf-8' />
    <title>hello world</title>
    <script>
      // 接收domain1的数据
      window.addEventListener('message', (e) => {
        console.log('182.254.197.28接收到数据:' + e.data)
        const data = JSON.parse(e.data)
        if (data) {
          data.name = 'yuzhanglong'
          data.age = 20
          // 处理后再发回domain1
          window.parent.postMessage(JSON.stringify(data), 'http://localhost:63342')
        }
      }, false)
    </script>
  </head>
  <body>
    hello world
  </body>
</html>
```

小窗口监听`message`事件，接收传来的消息，然后作出修改，返回给发送者，发送者同样可以通过监听`message`事件来接收消息。

我们可以看到，打开本地页面，控制台打印了如下内容：

![](http://cdn.yuzzl.top/blog/20201106111516.png)

## 客户端存储

### sessionstorage

#### 描述

sessionStorage 对象只存储会话数据，这意味着数据只会存储到浏览器关闭。这跟浏览器关闭时会消失的会话 cookie 类似。存储在 sessionStorage
中的数据不受页面刷新影响，可以在浏览器崩溃并重启后恢复。主要用于存储只在会话期间有效的小块数据。

### cookie

#### 描述

HTTP cookie 通常也叫作 cookie，最初用于在客户端存储会话信息。这个规范要求服务器在响应 HTTP 请求时，通过发送 Set-Cookie HTTP 头部包含会话信息。

请看下面的HTTP报文：

```
HTTP/1.1 200 OK
Content-type: text/html
Set-Cookie: name=value
Other-header: other-header-value
```

这个 HTTP 响应会设置一个名为"name"，值为"value"的 cookie。名和值在发送时都会经过 URL 编码。浏览器会存储这些会话信息，并在之后的每个请求中都会通过 HTTP 头部 cookie 再将它们发回服务器。

#### 特点

##### 和特定域绑定

设置 cookie 后，它会与请求一起发送到创建它的域。这个限制能保证cookie 中存储的信息只对被认可的接收者开放，不被其他域访问。

##### 有大小限制

在某些浏览器上有大小限制。超过最大限制就会以**LRU**原则将旧的cookie删除。

##### 非安全环境

cookie数据**不是安全的**，任何人都可以获得，常见的 XSRF 攻击就可以利用浏览器的 cookie 来进行非法的访问。

#### 组成

请看下图，这是我们访问**MDN官网**的COOKIE内容，可以看到一条COOKIE有10个参数。

![](http://cdn.yuzzl.top/blog/20201103093213.png)

下面介绍几个重要的参数：

- **name**：标识cookie的名称

- **value**：存储在cookie的字符串

- **domain**：域，上图中的**.developer.mozilla.org**和**developer.mozilla.org**是有区别的（注意前面的点），有点号标识这个值可以包含子域。

- **path**：路径，请求url**包含这个路径**才会发送这个cookie。

- **SameSite**：这个属性很有意思，它是用来限制第三方cookie的，从而减少安全风险（例如**XSRF攻击**），它可以设置三个值：

    - None：Chrome 计划将`Lax`变为默认设置。这时，网站可以选择显式关闭`SameSite`属性，将其设为`None`。不过，前提是必须同时设置`Secure`属性（Cookie 只能通过 HTTPS
      协议发送），否则无效。

    - Strict：`Strict`最为严格，完全禁止第三方 Cookie，跨站点时，任何情况下都不会发送 Cookie。换言之，只有当前网页的 URL 与请求目标一致，才会带上 Cookie。

  > 这个规则过于严格，可能造成非常不好的用户体验。比如，当前网页有一个 GitHub 链接，用户点击跳转就不会带有 GitHub 的 Cookie，跳转过去总是未登陆状态。

    - Lax：`Lax`规则稍稍放宽，大多数情况也是不发送第三方 Cookie，但是**导航到目标网址的 Get 请求除外**，具体内容请看下表。

  | 请求类型  |      示例      |    正常情况 | Lax         |
                                                                                                                                                                                      | :-------- | :------------: | ----------: | :---------- |
  | 链接      |       `<a href="..."></a>`       | 发送 Cookie | 发送 Cookie |
  | 预加载    |       `<link rel="prerender" href="..."/>`       | 发送 Cookie | 发送 Cookie |
  | GET 表单  |       `<form method="GET" action="...">`       | 发送 Cookie | 发送 Cookie |
  | POST 表单 |       `<form method="POST" action="...">`       | 发送 Cookie | 不发送      |
  | iframe    |       `    <iframe src="..."></iframe>`       | 发送 Cookie | 不发送      |
  | AJAX      | `$.get("...")` | 发送 Cookie | 不发送      |
  | Image     |       `<img src="...">`       | 发送 Cookie | 不发送      |

#### JS中操作Cookie

JS操作cookie依靠`document.cookie`属性，且最终的cookie的内容如下:

```javascript
name1 = value1;
name2 = value2;
name3 = value3
```

可见设置cookie主要依赖字符串拼接，并不直观，所以我们可以使用以下工具类(摘自JavaScript高级程序设计)：

```javascript
class CookieUtil {
  static get(name) {
    let cookieName = `${encodeURIComponent(name)}=`,
      cookieStart = document.cookie.indexOf(cookieName),
      cookieValue = null;
    if (cookieStart > -1) {
      let cookieEnd = document.cookie.indexOf(";", cookieStart);
      if (cookieEnd === -1) {
        cookieEnd = document.cookie.length;
      }
      cookieValue = decodeURIComponent(document.cookie.substring(cookieStart
        + cookieName.length, cookieEnd));
    }
    return cookieValue;
  }

  static set(name, value, expires, path, domain, secure) {
    let cookieText =
      `${encodeURIComponent(name)}=${encodeURIComponent(value)}`
    if (expires instanceof Date) {
      cookieText += `; expires=${expires.toGMTString()}`;
    }
    if (path) {
      cookieText += `; path=${path}`;
    }
    if (domain) {
      cookieText += `; domain=${domain}`;
    }
    if (secure) {
      cookieText += "; secure";
    }
    document.cookie = cookieText;
  }

  static unset(name, path, domain, secure) {
    CookieUtil.set(name, "", new Date(0), path, domain, secure);
  }
}
```

### localstorage

#### 描述

localstorage也是浏览器客户端一种持久存储的机制。

#### 和sessionStorage的区别

存储在 localStorage 中的数据会保留到通过 JavaScript 删除或者用户清除浏览器缓存。 localStorage 数据不受页面刷新影响，也不会因关闭窗口、标签页或重新启动浏览器而丢失。

## 浏览器运行机制

### 浏览器是多进程的

- 浏览器是多进程的
- 浏览器之所以能够运行，是因为系统给它的进程分配了资源（cpu、内存）
- 简单点理解，每打开一个Tab页，就相当于创建了一个独立的浏览器进程。

从浏览器的任务管理器中我们可以查看浏览器的进程信息：

![](http://cdn.yuzzl.top/blog/20201106123217.png)

浏览器的多进程可以防止单个进程崩溃导致整个浏览器崩溃，并且可以充分利用多核优势。

#### 常见进程

##### 浏览器主进程

浏览器的主进程负责协调、主控。它的作用有：

- 负责浏览器界面显示，与用户交互。如前进，后退等
- 负责各个页面的管理，创建和销毁其他进程
- 将Renderer进程得到的内存中的Bitmap，绘制到用户界面上
- 网络资源的管理，下载等。

##### 第三方插件进程

使用某个插件的进程。

##### GPU进程

用于图形的绘制。

#### 核心 -- 渲染进程

浏览器的渲染进程是多线程的。主要有以下线程：

##### GUI

- 负责渲染浏览器界面，解析HTML，CSS，构建DOM树和RenderObject树，布局和绘制等。
- 当界面需要重绘（Repaint）或由于某种操作引发回流 (reflow) 时，该线程就会执行。

> 关于重绘、重排的内容请参考浏览器渲染流程一节。

##### JS引擎线程

- JS引擎线程负责解析Javascript脚本，运行代码。
- JS引擎一直等待着任务队列中任务的到来，然后加以处理，一个Tab页（render进程）中无论什么时候都只有一个JS线程在运行JS程序。
- 注意，**GUI渲染线程与JS引擎线程是互斥的**，所以如果JS执行的时间过长，这样就会造成页面的渲染不连贯，导致页面渲染加载阻塞。

##### 事件触发线程

事件触发线程归属于浏览器。当执行类似于`setTimeout()`/`ajax`/`鼠标事件`时会将对应任务添加到事件线程中，当事件的符合条件被触发时，该线程会把事件添加到待处理队列的队尾，等待JS引擎空闲时处理。

##### 定时触发器线程

`setInterval`与`setTimeout`所在线程，定时计数器不会由JS引擎记数（因为它是单线程，会阻塞），所以通过一个单独的线程来计时，完成后添加到事件队列，等待JS引擎空闲时处理。

##### 异步HTTP请求线程

`XMLHttpRequest`每发送一个请求都是一个线程。

将检测到状态变更时，如果设置有回调函数，异步线程就**产生状态变更事件**，将这个回调再放入事件队列中。再由JavaScript引擎执行。

##### 动画方案

如果要为元素设置动画，则浏览器必须在每个帧之间运行这些操作。大多数显示器每秒刷新屏幕 60 次（60 fps），当屏幕每帧都在变化，人眼会觉得动画很流畅。但是，如果动画丢失了中间一些帧，页面看起来就会卡顿。

即使渲染操作能跟上屏幕刷新，这些计算也会在主线程上运行，这意味着当你的应用程序运行 JavaScript 时动画可能会被阻塞。

![](http://cdn.yuzzl.top/blog/16670367652ef2d6)

我们可以将 JavaScript 操作**划分为小块**，并使用 `requestAnimationFrame()` 在每个帧上运行，如下图：

![](http://cdn.yuzzl.top/blog/16670367a6c767bd)

我们也可以在 **Web Worker** 中运行 JavaScript 以避免阻塞主线程。

> web worker 是**运行在后台的 JavaScript**，独立于其他脚本，不会影响页面的性能。您可以继续做任何愿意做的事情：点击、选取内容等等，而此时 web worker 在**后台运行**。
>
> 关于web worker的更多信息，请参考JS篇的**工作者线程**部分。

##### 何时发生

抓住“计算节点的位置和几何信息”这个特点，例如：

- 添加或删除可见的DOM元素
- 元素的位置发生变化
- 元素的尺寸发生变化（包括外边距、内边框、边框大小、高度和宽度等）
- 内容发生变化，比如文本变化或图片被另一个不同尺寸的图片所替代。
- 页面一开始渲染的时候（这肯定避免不了）
- 浏览器的窗口尺寸变化（因为回流是根据视口的大小来计算元素的位置和大小的）

##### 性能优化

###### 开发者层面

- 合并多次对DOM和样式的修改，下面的代码可能会触发三次重绘（虽然浏览器可能为我们作了优化）。

```javascript
const el = document.getElementById('test');
el.style.padding = '5px';
el.style.borderLeft = '1px';
el.style.borderRight = '2px'
```

- 修改DOM时使用文档片段（fragment），构建完成之后再注入DOM中。

- 声明新的复合图层，浏览器为它单独分配资源 -- **脱离文档流**的它无论如何变化都不会引起默认图层的回流重绘。

## 输入一个URL到页面展示的流程

### DNS解析

将输入浏览器的URL进行DNS解析，去定位其真实的IP地址，为接下来发起TCP连接做准备。

> 关于DNS的详细内容参见计算机网络篇

### 发起TCP连接

在客户端发送数据之前会发起**tcp三次握手**用以同步客户端和服务端的序列号和确认号。为发送请求报文做准备。

### HTTP请求

客户端根据域名得到相应ip以后开始**发送http请求**，HTTP请求分为三个部分：

- TCP三次握手
- http请求响应信息
- 关闭TCP连接

> 关于HTTP的详细内容参见计算机网络篇

### 解析、渲染页面

主要分为以下四个步骤：

- DOM树的生成
- CSS规则树的生成
- 布局
- 绘制

对于这些步骤的详细信息请参阅<a href="#浏览器渲染流程">浏览器渲染流程</a>

## 前端路由

### 概念

什么是路由？早期，路由其实是个**后端概念**，在服务端渲染（**SSR**）的app中，后端处理HTML，并返回它，像这样：

```http
http://www.my-school.edu.cn/art/2020/10/30/art_16_40029.html
```

我们可以通过不同的路径，请求不同的静态资源，这种方式就是路由。

在后来我们有了**SPA**，被称为单页应用，单页应用不仅仅是在页面交互是无刷新的，连**页面跳转**都是**无刷新**的，为了实现单页应用，所以就有了前端路由。

### 前端路由原理

#### hashRouter

##### hash值的变化不会让浏览器发起请求

假设我们有个HTML：

```html
<!DOCTYPE html>
<html lang='en'>
  <head>
    <meta charset='UTF-8'>
    <title>Title</title>
  </head>
  <body>
    hello world
  </body>
</html>
```

使用本地服务器托管，访问页面：

![](http://cdn.yuzzl.top/blog/20201101151513.png)

可以看到页面正常显示了。

这时我们往地址栏的url后加入一些内容：

![](http://cdn.yuzzl.top/blog/20201101151633.png)

回车，我们发现浏览器并没有刷新。即就是说hash 值的变化，并不会导致浏览器向服务器发出请求，浏览器不发出请求，也就不会刷新页面。

基于浏览器的这个特性，我们可以用**hash模式**实现一个路由，首先我们来了解一下有关hash路由的API。

##### hashChange事件

HTML5 增加了 hashchange 事件，用于在 URL 散列值（ URL 最后#后面的部分）发生变化时通知开发者。这是因为开发者经常在 Ajax 应用程序中使用 URL 散列值存储状态信息或路由导航信息。

尝试在浏览器控制台运行以下代码：

```javascript
window.addEventListener("hashchange", (event) => {
  console.log(`Old URL: ${event.oldURL}, New URL: ${event.newURL}`);
});
```

![](http://cdn.yuzzl.top/blog/20201101152635.png)

然后修改当前url的散列值，你会发现回调函数被触发了。

![](http://cdn.yuzzl.top/blog/20201101152720.png)

##### 预期的流程

知道了上面的API，我们可以构建出如下的流程：

- 旧地址为`http://localhost:63342/frontendRouter/#/page1`
- 修改hash值，准备跳转到新地址`http://localhost:63342/frontendRouter/#/page2`，但是要注意跳转的类型：
    - **刷新页面**，是不会触发`hashchange`的，我们可以使用`load`事件。
    - 输入链接回车跳转，会触发`hashchange`。
    - 浏览器的后退按钮，会触发`hashchange`

- 根据我们的hash来匹配相应的页面。（这里的”页面“我们可以简单地看成一个HTML片段），如果匹配不到，我们执行重定向。
- 替换相应的DOM。

##### DEMO

下面是一个简单的**hashRouterDEMO**:

```html
<!DOCTYPE html>
<html lang='en'>
  <head>
    <meta charset='UTF-8'>
    <title>Title</title>
    <script>
      const myHashTable = {
        page1: "<div>我是第一页</div>",
        page2: "<div>我是第二页</div>",
        default: "hello world"
      }

      window.addEventListener("load", () => {
        const newHash = location.hash.split("#/")[1];
        document.body.innerHTML = myHashTable.hasOwnProperty(newHash) ? myHashTable[newHash] : myHashTable["default"];
      });

      window.addEventListener("hashchange", (event) => {
        console.log(`url Hash值被改变！Old URL: ${event.oldURL}, New URL: ${event.newURL}`);
        const newHash = event.newURL.split("/#/")[1];
        document.body.innerHTML = myHashTable.hasOwnProperty(newHash) ? myHashTable[newHash] : myHashTable["default"];
      });
    </script>
  </head>
  <body>
    hello world
  </body>
</html>
```

##### 刷新白屏问题

如果你使用一些前端框架和它的路由管理插件，那么有时会出现刷新白屏现象。

这一现象的本质在于：我们使用`pushState()`创建的每一个**假的URL(可以看成一个“状态”)**并没有在服务器上对应一个**真实物理URL**。所谓的白屏其实就是404错误。

![](http://cdn.yuzzl.top/blog/20201101185002.png)

![](http://cdn.yuzzl.top/blog/20201101185026.png)

如果服务端使用了**nginx**，那么我们可以这样配置来处理这个问题（方案就是将当前的url重定向到index.html下）：

```nginx
server {
    listen       80;
    server_name  xxxx.yuzzl.top;
    root  xxxxxx;
    
    // 下面是重点！
    location / {
        try_files $uri $uri/  /index.html;
    }
}
```

## NPM原理

### 规范的版本管理方案 -- 语义化版本控制规范（SemVer）

npm包 中的模块版本都需要遵循 SemVer规范——由 Github 起草的一个具有指导意义的，统一的版本号表示规则。实际上就是 Semantic Version（语义化版本）的缩写。

具体信息这里不赘述，请查看官网：

> SemVer规范官网： https://semver.org

#### 如何控制版本号？

##### 规约

标准的版本号必须采用 `X.Y.Z`的格式，其中 X、Y 和 Z 为非负的整数，且禁止在数字前方补零。X 是**主版本号**（当你做了不兼容的 API 修改）、Y 是次版本号（当你做了向下兼容的功能性新增）、而 Z
为修订号（当你做了向下兼容的问题修正）。每个元素必须以数值来递增。例如：1.9.1 -> 1.10.0 -> 1.11.0。

使用下面命令尝试查看一个库的版本号：

```shell
npm view axios versions
```

![](http://cdn.yuzzl.top/blog/20201104102455.png)

##### 控制工具

详细内容可以查看 semver文档：https://github.com/npm/node-semver

```shell
npm install semver
```

### 依赖管理 -- package.json

#### 基本属性

一些描述类的基本属性在这里不再赘述，都是见文知意的，例如版本号、介绍等信息。我们重点讲依赖配置。

#### 依赖配置

##### 总述

依赖配置可以是这样：

```json
{
  "dependencies": {
    "antd": "ant-design/ant-design#4.0.0-alpha.8",
    "axios": "^1.2.0",
    "test-js": "file:../test",
    "test2-js": "http://cdn.com/test2-js.tar.gz",
    "core-js": "^1.1.5"
  }
}
```

依赖包的名称可以有以下几种方案：

- 版本号，会从npm服务器下载
- 下载地址，远程下载到本地
- 本地路径（使用file协议）
- GitHub路径

##### devDependencies

有一些包有可能你只是在开发环境中用到，这些依赖照样会在你本地进行 `npm install` 时被安装和管理，但是不会被安装到生产环境：

```json
{
  "devDependencies": {
    "jest": "^24.3.1",
    "eslint": "^6.1.0"
  }
}
```

##### peerDependencies

指定正在开发模块所依赖的版本以及用户安装的依赖包版本的兼容性。

例如某个webpack loader的依赖：

```json
{
  "peerDependencies": {
    "webpack": "^4.0.0 || ^5.0.0",
    "file-loader": "*"
  }
}
```

如果用户安装了`webpack3.0`，那么npm会给出一个警告。

##### optionalDependencies

某些场景下，依赖包可能不是强依赖的，这个依赖包的功能可有可无，当这个依赖包无法被获取到时，你希望 `npm install` 继续运行，而不会导致失败，你可以将这个依赖放到 `optionalDependencies`
中，注意 `optionalDependencies` 中的配置将会覆盖掉 `dependencies` 所以只需在一个地方进行配置。

当然，引用 `optionalDependencies` 中安装的依赖时，一定要做好异常处理，否则在模块获取不到时会导致报错。

##### bundledDependencies

和以上几个不同，`bundledDependencies` 的值是一个数组，数组里可以指定一些模块，这些模块将在这个包发布时被一起打包。

#### 目录相关

##### 程序入口

指定程序的**主入口文件**。

```json
{
  "main": "lib/basic_redux.js"
}
```

##### 命令行工具

```json
{
  "bin": {
    "conard": "./bin/basic_redux.js"
  }
}
```

##### 发布文件配置

```json
{
  "files": [
    "dist"
  ]
}
```

#### 脚本配置

##### scripts

```json
{
  "scripts": {
    "start": "npm run build -- -w",
    "clean": "del-cli dist",
    "build": "cross-env NODE_ENV=production babel src -d dist --copy-files"
  }
}
```

##### config

用来配置环境变量。

`config` 字段用于配置脚本中使用的环境变量，例如下面的配置，可以在脚本中使用`process.env.npm_package_config_port`进行获取。

```json
{
  "config": {
    "port": "8080"
  }
}
```

## 前端模块化

### commonJS

#### 引用关系

`exports`、`module.exports`、`require`是CommonJS规范的核心，下图表示了模块间的引用关系：

![](http://cdn.yuzzl.top/blog/20201113204858.png)

#### require的返回值是exports的浅拷贝

使用`setTimeout`, 我们可以发现require的返回值是`exports`的浅拷贝。

![](http://cdn.yuzzl.top/blog/20201113203257.png)

#### module.exports和exports

CommonJS中没有`module.exports`的概念，为了实现模块的导出，Node中使用的是`Module`类，每一个模块都是`Module`的一个实例，也就是`module`，它才是导出的真正实现者。

也就是说，**他们的关系：module对象的exports属性是exports对象的一个引用**。 我们来实践证明之：

没有修改`module.exports`：

![](http://cdn.yuzzl.top/blog/20201113205848.png)

当`module.exports`被修改:

![](http://cdn.yuzzl.top/blog/20201113211123.png)

**一句话总结**：

NodeJS是通过`module.exports`来实现模块化的，为了迎合`commonJS`规范，`module.exports`默认指向了`exports`, 如果将`module.exports`
指向了一个新的值，name最终导出的就是`module.exports`指向的内容。

#### 模块加载

##### 模块在被第一次引入时，模块中的js代码会被运行一次

![](http://cdn.yuzzl.top/blog/20201113222813.png)

##### 模块被多次引入时，会缓存，最终只加载（运行）一次

![](http://cdn.yuzzl.top/blog/20201113223149.png)

因为每个`module`对象都有一个`loaded`属性，用来判断是否被加载过。

从NodeJS源码中也可以看出来：

![](http://cdn.yuzzl.top/blog/20201114085813.png)

##### 缺点

CommonJS加载模块是**同步**的，在一个CJS模块中，加载，实例化，执行是一次完成的，中间没有停顿。从文件系统中加载文件花费的时间远远小于从网络下载(浏览器环境下)。

![](http://cdn.yuzzl.top/blog/12_cjs_require-500x298.png)

### ES Module

`exports`、`module.exports`、`require`是ES Module规范的核心，具体的使用这里不再赘述，下面只介绍几个重点：

#### import()动态导入

通过`import()`我们可以做到模块的动态加载：

```javascript
const Component = () => {
  let element = document.createElement('div');
  let button = document.createElement('button');
  let br = document.createElement('br');

  button.innerHTML = '单击我加载 print.js';
  element.innerHTML = "hello world~";
  element.appendChild(br);
  element.appendChild(button);
  button.onclick = () => import('./print')
    .then((m) => {
      m.default();
    });
  return element;
}

document.body.appendChild(Component());
```

还可以将**变量**用于模块路径：

```javascript
import(`${path}/foo.js`);
```

#### ES Module是异步的

我们都知道在`script`标签上加上`async`属性, 主线程就不会被阻塞。

```html

<script src='main.js' type='module'></script>
<!-- 这个js文件的代码不会被阻塞执行 -->
<script src='main.js'></script>
```

设置了`type=module`的代码，相当于在`script`标签上也加上了 `async` 属性。

#### 加载原理

推荐一篇优秀文章：https://hacks.mozilla.org/2018/03/es-modules-a-cartoon-deep-dive 它非常详细地解释了ES Module的加载原理，下面内容的部分图片资源来自该网站。

下面简要地描述ES Module的加载原理。

##### 查找和拉取文件

在HTML中，开发者通过`script`标签告诉加载器。通过导入声明的模块标识符。

当加载器开始拉取一个URL时候，它会将这个URL放入一个`module map`（模块映射表）中，并且标记为`fetching`。然后他会发起请求，进入**下一个文件的拉取**。

![](http://cdn.yuzzl.top/blog/15_module_map.png)

如果另外的模块依赖了同样的文件，加载器将会查看模块映射表中的每个URL，如果它看到了**fetching**的存在，它会直接进入下一个URL。（我们可以理解为**缓存**）

##### 解析

文件加载完之后浏览器将为它生成一个**解析记录**，所谓解析记录我们可以理解为**模块的名片**。

![](http://cdn.yuzzl.top/blog/25_file_to_module_record.png)

##### 模块连接与实例化

JS引擎为模块创造一个**环境记录**（environment record）来管理模块记录中的变量。将每一个exports指向内存的某个位置。**export**连接完成之后，再处理**import**
（有先后顺序的原因：首先连接导出就能保证之后所有的导入都能够和它所匹配的导出相连），它们也会指向相对应的位置，如下图：

![](http://cdn.yuzzl.top/blog/30_live_bindings_01-768x316.png)

注意，在导出环节导出的内容是原内容的一份**拷贝**（区别于浅拷贝），也就是说，你如果在`import`部分修改某个值，那么`export`部分不会发生变化，反而会报错，我们来实践一下：

![](http://cdn.yuzzl.top/blog/20201114100520.png)

通过上图我们可以发现，拷贝的结果是由`const`修饰的，我们无法直接修改。

不过，模块导出方可以随时改变导出值：

![](http://cdn.yuzzl.top/blog/31_cjs_variable-768x174.png)

测试一下：

![](http://cdn.yuzzl.top/blog/20201114100852.png)

##### 执行

最后，JS引擎自顶向下执行代码，向内存中的地址填值。

###### 副作用问题

如果模块执行的过程中发送了网络请求（这是一个副作用）, 因为潜在的副作用，你只希望模块执行一次。但是和实例化连接过程多次进行结果严格一直不同，每次的执行都会有不同的结果。

这也是我们为什么有模块映射表的原因。模块映射表通过唯一的URL只为模块添加一条模块记录。这就保证了每个模块只执行一次。

## TODO

浏览器底层（并发）
