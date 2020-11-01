# 前端基础

https://zhuanlan.zhihu.com/p/24764131

https://developers.google.com/web/fundamentals/performance/optimizing-content-efficiency/optimize-encoding-and-transfer?hl=zh-cn

https://developers.google.com/web/fundamentals/performance/optimizing-content-efficiency/eliminate-downloads?hl=zh-cn

https://developers.google.com/web/fundamentals/performance/optimizing-content-efficiency/javascript-startup-optimization?hl=zh-cn

https://github.com/chenjigeng/blog/issues/4

https://developer.mozilla.org/zh-CN/docs/Learn/HTML/Multimedia_and_embedding/Responsive_images

## 跨源资源共享(CORS)

### 总述

通过 **XHR** 进行 **Ajax 通信**的一个主要限制是跨源安全策略。默认情况下， XHR 只能访问与发起请求的页面在同一个域内的资源。这个安全限制可以防止某些恶意行为。

### CORS

跨源资源共享（ CORS， Cross-Origin Resource Sharing）定义了浏览器与服务器如何实现跨源通信。CORS 背后的基本思路就是使用自定义的 HTTP 头部允许浏览器和服务器相互了解，以确实请求或响应应该成功还是失败。  

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

### 预检请求  

CORS 通过一种叫**预检请求**（ preflighted request）的服务器验证机制，允许使用自定义头部、除 GET 和 POST 之外的方法，以及不同请求体内容类型。在要发送涉及上述某种高级选项的请求时，会先向服务器发送一个“预检”请求。这个请求使用 OPTIONS 方法发送并包含以下头部。  

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

### 凭据请求

默认情况下，跨源请求不提供凭据（ cookie、 HTTP 认证和客户端 SSL 证书）。可以通过将withCredentials 属性设置为 true 来表明请求会发送凭据。如果服务器允许带凭据的请求，那么可以在响应中包含如下 HTTP 头部：

```http
Access-Control-Allow-Credentials: true
```

假如我们发送了凭据请求但是响应没有这个头部，那么浏览器**不会将响应交给JavaScript调用**。（在XMLHTTPRequest的接口层面显示为 `status=0`，调用`onerror()`）

### 替代性跨源技术

#### 图片探测

通过`<img>`标签来实现跨域通信，例如：

```javascript
let img = new Image();
img.onload = img.onerror = function () {
    alert("Done!");
};
img.src = "http://www.example.com/test?name=Nicholas";
```

图片探测频繁用于跟踪用户在页面上的点击操作或动态显示广告。当然它只能发送GET请求并且无法获取服务器的响应。

#### JSONP

##### 介绍

**JSONP** 是“JSON with padding”的简写，是在 Web 服务上流行的一种 JSON 变体。   

JSONP 是通过动态创建`<script>`元素并为 src 属性指定跨域 URL 实现的。

- JSONP 是从不同的域拉取可执行代码。如果这个域并不可信，则可能在响应中加入恶意内容。
  此时除了完全删除 JSONP 没有其他办法。在使用不受控的 Web 服务时，一定要保证是可以信任的。  
- 不好确定 JSONP 请求是否失败。虽然 HTML5 规定了`<script>`元素的 `onerror` 事件处理程序，但还没有被任何浏览器实现。为此，开发者经常使用计时器来决定是否放弃等待响应。

##### 实践

下面是我从网上找到的一个JSONP API，用来获取本地天气。

```http
https://query.asilu.com/weather/baidu?callback=handleResponse
```

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
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
handleResponse({"city":"杭州","pm25":"66","weather":["数组的内容被省略了"]});
```

这下更明白JSONP实现的原理了吧，浏览器获取这串代码（js脚本），就会直接`handleResponse()` -- 也就是我们之前定义的：

```javascript
const handleResponse = (response) => {
  console.log(response);
}
```

最终，浏览器控制台打印了我们想要的JSON数据：

![](http://cdn.yuzzl.top/blog/20201101205643.png)

## 性能优化

### 合理利用http缓存

合理利用Http缓存可以减少我们向服务器的请求量，从而加快页面加载速度。关于**Http缓存**的相关知识请阅读计算机网络部分。

### 优化资源的编码/大小

#### 图片优化

##### 选择正确的图片尺寸

将一个较大尺寸的图片后添加到页面的较小一块区域，显示部分是小了，但是我们下载的图片还是那个“大尺寸的大小”。浪费了流量并损害了页面性能。

##### 图片自适应

我们按照不同宽度准备好几张照片，达到**为不同设备加载不同图片**的目的，这便是响应式图片（图片自适应）。针对这种需求，我们使用h5的`<img>`标签新特性**srcset**和**sizes**。

例如：

```html
<img srcset="elva-fairy-320w.jpg 320w,
             elva-fairy-480w.jpg 480w,
             elva-fairy-800w.jpg 800w"
     sizes="(max-width: 320px) 280px,
            (max-width: 480px) 440px,
            800px"
     src="elva-fairy-800w.jpg" alt="Elva dressed as a fairy">
```

上面的代码中，`srcset`表示“**图像集**”，`sizes`表示”**媒体条件**“。如果支持浏览器以视窗宽度为480px来加载页面，那么`(max-width: 480px)`的媒体条件为真，因此`440px`的槽会被选择，所以`elva-fairy-480w.jpg`将加载，因为它的的固定宽度（`480w`）**最接近于**`440px`。800px的照片大小为128KB而480px版本仅有63KB大小—节省了65KB。现在想象一下，如果这是一个有很多图片的页面。使用这种技术会节省移动端用户的大量带宽。

> 注意：
>
> - 如果出现兼容性问题，它会正常加载src属性下的图片

#### Javascript启动优化

##### 仅发送用户所需的代码

- 使用代码拆分将JavaScript 分解成关键部分和非关键部分。我们可以使用**webpack**等工具实现。
- 延迟加载非关键代码。（懒加载）

##### 源码级别的压缩

压缩冗余或不必要数据的最佳方法是将其全部消除。我们不能只是删除任意数据，但在某些环境中，我们可能对数据格式及其属性有内容特定了解，往往可以在不影响其实际含义的情况下显著减小负载的大小。

例如，在开发环境下，我们需要注释详细，缩进工整的代码，但是在生产环境下，那些多余的注释/换行/缩进就显得毫无意义。

```html
<html>
  <head>
  <style>
     /* awesome-container is only used on the landing page */
     .awesome-container { font-size: 120% }
     .awesome-container { width: 50% }
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
- CSS 压缩程序会注意到采用低效率的方式为“.awesome-container”定义规则，并且会将两个声明折叠为一个而不影响任何其他样式，从而节省更多字节。
- 空白（空格和制表符）能够在 HTML、CSS 和 JavaScript 中给开发者提供方便。 可以增加一个压缩程序来去掉所有制表符和空格。

最后，上面的代码被压缩成了这样：

```javascript
<html><head><style>.awesome-container{font-size:120%;width: 50%}
</style></head><body><div>…</div><script>awesomeAnalytics();
</script></body></html>
```

#### GZIP
说到资源的大小优化，一个经典的案例便是**GZIP**。

##### 总述

HTTP协议上的**gzip**编码是一种用来改进web应用程序性能的技术，web服务器和客户端（浏览器）必须共同支持gzip。目前主流的浏览器，Chrome,firefox,IE等都支持该协议。常见的服务器如Apache，Nginx，IIS同样支持gzip。

gzip压缩比率在3到10倍左右，可以大大节省服务器的网络带宽。而在实际应用中，并不是对所有文件进行压缩，通常只是压缩静态文件。

##### 流程

下图是gzip的工作流程：

![](http://cdn.yuzzl.top/blog/20201101225138.png)

- 浏览器请求url，并在request header中设置属性accept-encoding:gzip。表明浏览器支持gzip，例如下图：

  ![](http://cdn.yuzzl.top/blog/20201101225226.png)

- 服务器收到浏览器发送的请求之后，判断浏览器是否支持gzip，如果支持gzip，则向浏览器传送压缩过的内容，不支持则向浏览器发送未经压缩的内容。

  如果支持，response headers返回**content-encoding:gzip**

  ![](http://cdn.yuzzl.top/blog/20201101225238.png)

- 浏览器接收到服务器的响应之后判断内容是否被压缩，如果被压缩则解压缩显示页面内容

##### 实践：NGINX与GZIP

下面是一个nginx配置，是本人部署的一个真实案例。

```nginx
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

下面给出解释（结合nginx官方文档）：

- **gzip on**：开启或者关闭gzip模块
- **gzip_buffers**：设置系统获取几个单位的缓存用于存储gzip的压缩结果数据流。 例如 4 4k 代表以4k为单位，按照原始数据大小以4k为单位的4倍申请内存。 4 8k 代表以8k为单位，按照原始数据大小以8k为单位的4倍申请内存。
- **gzip_comp_level**：gzip压缩比，1 压缩比最小处理速度最快，9 压缩比最大但处理最慢（传输快但比较消耗cpu）。
- **gzip_min_length**：设置**允许压缩的页面最小字节数**，页面字节数从header头中的Content-Length中进行获取。默认值是0，不管页面多大都压缩。建议设置成大于1k的字节数，小于1k可能会越压越大。 即: gzip_min_length 1024。
- **gzip_types**：匹配MIME类型进行压缩，（无论是否指定）"text/html"类型总是会被压缩的。

### 静态资源部署到CDN

网站上的静态资源css、js、图片应该全部使用**CDN**分发, 以加快访问速率。

关于CDN详细的内容请参照计算机网络篇 -- CDN。

### 衡量第三方JavaScript脚本

有时，导致网页变慢的性能问题是由于**第三方脚本**引起的：广告，分析，跟踪器，社交媒体按钮等。

它们可能：

- 向多个服务器发出过多的网络请求。网站提出的请求越多，加载时间就越长。

- 下载太多的JavaScript ，使主线程忙。太多的JavaScript会阻止DOM的构建，从而延迟了页面呈现的速度。

- 下载未经优化的大型图像文件或视频。

- 随意加载第三方脚本可能造成**单点故障** （SPOF）

- 不使用缓存、不使用压缩。

- 阻止内容显示，直到它们完成处理。

- 使用已知对用户体验有害的旧版API。

- 过多的DOM元素或昂贵的CSS选择器。

- 包含多个第三方嵌入会导致多个框架和库被拉多次。这是浪费的，并且加剧了性能问题。

我们可以：

- 使用异步和延迟。

  - 例如下面的代码使用了`defer`属性，表示脚本**被延迟到整个页面解析完成**再执行：

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

  > 提示：defer 属性只对外部脚本文件才有效 。

  - 请看下面代码，它使用了`async`属性。

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

  使用`async`的意义在于，不必等脚本下载和执行完后再加载页面，同样也不必等到该异步脚本下载和执行后再加载其他脚本。

  > 提示：如上所述，异步脚本不应该在加载期间修改 DOM。

- 自托管第三方脚本，缺点是自托管的脚本可能无法同步到最新版本。

## XSS攻击

### 概念

XSS是跨站脚本攻击(Cross Site Scripting)，为不和层叠样式表(Cascading Style Sheets, CSS)的缩写混淆，故将跨站脚本攻击缩写为XSS。恶意攻击者往Web页面里插入恶意Script代码，当用户浏览该页之时，嵌入其中Web里面的Script代码会被执行，从而达到恶意攻击用户的目的。

### 经典案例

假如某网站的评论区允许用户输入文本来评论，一般情况下用户的文本没有啥问题，在拿到服务端的数据之后，它会这样显示：

```html
<div class="comment">hello world</div>
```

但是如果有心的用户输入了这样的文本：

```html
<script>alert(“hahahaha~”)</script>
```

那么最终我们显示在html里面的内容会是这样：

```html
<div class="comment">
  <script>alert(“hahahaha~”)</script>
</div>
```

这样只要这条"评论"存在，那么所有访问该网站的用户都会在访问评论区时接收到一个非预期的弹窗。

另外，攻击者还可以利用XSS执行脚本，获取用户**cookie**或者**localstorage**的值，调用一些有权限的接口。

### 如何防御

#### 避免拼接 HTML

前端采用拼接 HTML 的方法比较危险，如果框架允许，使用 createElement、setAttribute 之类的方法实现。或者采用比较成熟的渲染框架，如 MVVM/React 等。

#### 利用模板引擎

开启模板引擎自带的 HTML 转义功能。

- jQuery、模板引擎等多采用 模板 + encode(数据) 的方式生成 html，因而：

  - 需要程序员根据上下文（js/css/html属性/...）仔细选择 encode 规则，心智负担重。

  - 可能存在遗漏encode，或采用了不正确的 encode 规则。

- MVVM、React 则将模板/jsx解析为树，在 renderer 里调用 DOM API，因而：

  - 减少了 encode 的必要性，减轻程序员心智负担。

  - 减少了 encode 操作，减少了 XSS 隐患。

- 但 MVVM、React 也不是万能的，依然需要警惕：
  - prerender / SSR 的 hydrate 过程会生成 html ，需要小心测试其中是否有 XSS 漏洞
  - dangerouslySetInnerHTML、onload=字符串、href=字符串 等，都有可能造成 XSS 漏洞。

#### 避免内联事件

尽量不要使用 `onLoad="onload('{{data}}')"`、`onClick="go('{{action}}')"` 这种拼接内联事件的写法。在 JavaScript 中通过 `.addEventlistener()`事件绑定会更安全。

## 客户端存储

### sessionstorage

#### 描述

sessionStorage 对象只存储会话数据，这意味着数据只会存储到浏览器关闭。这跟浏览器关闭时会消失的会话 cookie 类似。存储在 sessionStorage 中的数据不受页面刷新影响，可以在浏览器崩溃并重启后恢复。主要用于存储只在会话期间有效的小块数据。  

### cookie

#### 描述

HTTP cookie 通常也叫作 cookie，最初用于在客户端存储会话信息。这个规范要求服务器在响应
HTTP 请求时，通过发送 Set-Cookie HTTP 头部包含会话信息。

请看下面的HTTP报文：

```http
HTTP/1.1 200 OK
Content-type: text/html
Set-Cookie: name=value
Other-header: other-header-value
```

这个 HTTP 响应会设置一个名为"name"，值为"value"的 cookie。名和值在发送时都会经过 URL
编码。浏览器会存储这些会话信息，并在之后的每个请求中都会通过 HTTP 头部 cookie 再将它们发回服务器。

#### 特点

##### 和特定域绑定

设置 cookie 后，它会与请求一起发送到创建它的域。这个限制能保证cookie 中存储的信息只对被认可的接收者开放，不被其他域访问。

##### 有大小限制

在某些浏览器上有大小限制。超过最大限制就会以**LRU**原则将旧的cookie删除。

##### 非安全环境

cookie数据**不是安全的**，任何人都可以获得，常见的XSRF攻击就可以利用浏览器的cookie来进行非法的访问。

#### 组成

请看下图，这是我们访问**MDN官网**的COOKIE内容，可以看到一条COOKIE有10个参数。

![](../assets/images/COOKIE内容.jpg)

下面介绍几个重要的参数：

- **name**：标识cookie的名称

- **value**：存储在cookie的字符串

- **domain**：域，上图中的**.developer.mozilla.org**和**developer.mozilla.org**是有区别的（注意前面的点），有点号标识这个值可以包含子域。

- **path**：路径，请求url**包含这个路径**才会发送这个cookie。

- **SameSite**：这个属性很有意思，它是用来限制第三方cookie的，从而减少安全风险（例如**XSRF攻击**），它可以设置三个值：

  - None：Chrome 计划将`Lax`变为默认设置。这时，网站可以选择显式关闭`SameSite`属性，将其设为`None`。不过，前提是必须同时设置`Secure`属性（Cookie 只能通过 HTTPS 协议发送），否则无效。

  - Strict：`Strict`最为严格，完全禁止第三方 Cookie，跨站点时，任何情况下都不会发送 Cookie。换言之，只有当前网页的 URL 与请求目标一致，才会带上 Cookie。

  > 这个规则过于严格，可能造成非常不好的用户体验。比如，当前网页有一个 GitHub 链接，用户点击跳转就不会带有 GitHub 的 Cookie，跳转过去总是未登陆状态。

  - Lax：`Lax`规则稍稍放宽，大多数情况也是不发送第三方 Cookie，但是**导航到目标网址的 Get 请求除外**，具体内容请看下表。
  
  | 请求类型  |      示例      |    正常情况 | Lax         |
  | :-------- | :------------: | ----------: | :---------- |
  | 链接      |       `<a href="..."></a>`       | 发送 Cookie | 发送 Cookie |
  | 预加载    |       `<link rel="prerender" href="..."/>`       | 发送 Cookie | 发送 Cookie |
  | GET 表单  |       `<form method="GET" action="...">`       | 发送 Cookie | 发送 Cookie |
  | POST 表单 |       `<form method="POST" action="...">`       | 发送 Cookie | 不发送      |
  | iframe    |       `	<iframe src="..."></iframe>`       | 发送 Cookie | 不发送      |
  | AJAX      | `$.get("...")` | 发送 Cookie | 不发送      |
  | Image     |       `<img src="...">`       | 发送 Cookie | 不发送      |

#### JS中操作Cookie

JS操作cookie依靠`document.cookie`属性，且最终的cookie的内容如下:

```javascript
name1=value1;name2=value2;name3=value3
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

## 浏览器渲染流程

推荐这一系列的优秀的博文：[Inside look at modern web browser](https://developers.google.com/web/updates/2018/09/inside-browser-part3)《现代浏览器内部揭秘》，图文并茂，内容也是满满的干货。下文的部分图片取自这篇博文。

#### Step1：DOM树的生成

当渲染进程收到导航的提交消息并开始接收 HTML 数据时，**主线程**开始解析文本字符串（HTML）并将其转换为文档对象模型（DOM）。

##### 遇到外链时...

当遇到外链时，会单独开启一个下载线程去下载资源（http1.1是每一个资源的下载都要开启一个`http请求`，对应一个`tcp/ip`链接）

###### CSS

-  CSS下载时异步，不会阻塞浏览器构建DOM树
- 会阻塞渲染，也就是在构建渲染树(下面会提到)时，会等到css下载解析完毕后才进行（这点与浏览器优化有关，防止css规则不断改变，避免了重复的构建）

###### JavaScript

当 HTML 解析器遇到` <script>` 标记时，会暂停解析 HTML 文档，开始加载、解析并执行 JavaScript 代码。为什么？因为JavaScript 可以使用诸如 `document.write()` 的方法来改写文档，这会改变整个 DOM 结构。

> 注意：如果script标签中有`async`或者`defer`属性，那么它不会阻塞解析。
>
> 详见本模块的<a href="#衡量第三方JavaScript脚本">衡量第三方JavaScript脚本</a>

###### 图片资源

遇到图片等资源时，异步下载，不会阻塞解析，下载完毕后直接用图片**替换**其应该所处的位置。

#### Step2：生成CSS规则树

**主线程**解析 CSS 并确定每个 DOM 节点计算后的样式。

> 提示：即使你不提供任何 CSS，每个 DOM 节点都可能会具有样式，因为浏览器具有默认样式表。

#### Step3：布局，生成渲染树(也称为布局树)（Layout）

现在，**渲染进程**知道每个节点的样式和文档的结构，但这不足以渲染页面。

布局是计算元素几何形状的过程。**主线程**遍历计算样式后的 DOM 树，计算样式并创建**布局树**，其中包含 x / y 坐标和边界框大小等信息。

布局树可能与DOM树结构类似，但它仅包含页面上**可见内容**相关的信息。

例如，下面的这些css元素不是布局树的一部分：

```css
#element{
    display: none;
}

p::before{
	content:"Hi!"
}
```

> 注意: 利用visibility和opacity隐藏的节点，还是会显示在渲染树上的。只有display:none的节点才不会显示在渲染树上。

另外，还有一些标签，例如`<script>`、`<meta>`、`<link>`，也是不可见的。

#### Step4: 绘制（Paint）

拥有 DOM、样式和布局仍然不足以渲染页面。假设你正在尝试重现一幅画。你知道元素的大小、形状和位置，但你仍需要判断绘制它们的顺序。经典的案例就是`z-index`。

在绘制步骤中，**主线程**遍历**布局树**创建绘制记录。绘制记录是绘图过程的记录，就像是“背景优先，然后是文本，然后是矩形”。如果你使用过 JavaScript 绘制了 `<canvas>` 元素，那么这个过程对你来说可能很熟悉。

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



#### 流程总结

下面我们以一幅图总结浏览器渲染的整个过程：

![](http://cdn.yuzzl.top/blog/20201031201457.png)



#### 发生回流/重绘

如果（重新）执行上面的步骤3，即计算节点的位置和几何信息，这个过程称为回流。

同理可得，重新执行上面的步骤4，这个过程称为重绘。

##### 何时发生

抓住“计算节点的位置和几何信息”这个特点，例如：

- 添加或删除可见的DOM元素
- 元素的位置发生变化
- 元素的尺寸发生变化（包括外边距、内边框、边框大小、高度和宽度等）
- 内容发生变化，比如文本变化或图片被另一个不同尺寸的图片所替代。
- 页面一开始渲染的时候（这肯定避免不了）
- 浏览器的窗口尺寸变化（因为回流是根据视口的大小来计算元素的位置和大小的）

> 注意：回流一定会触发重绘，而重绘不一定会回流，这个结合上面的总结图片应该很好得出。

#####  性能优化

###### 浏览器层面

由于每次重绘都会造成额外的计算消耗，因此大多数浏览器都会通过**队列化**修改并批量执行来优化重排过程。浏览器会将修改操作放入到队列里，直到过了一段时间或者操作达到了一个阈值，才清空队列。

但是如果你调用了获取布局信息的相关API，例如：

```javascript
offsetTop、offsetLeft、offsetWidth、offsetHeight
scrollTop、scrollLeft、scrollWidth、scrollHeight
clientTop、clientLeft、clientWidth、clientHeight
getComputedStyle()
getBoundingClientRect
```

这些操作会强制队列刷新，如果要利用他们，尽量将值缓存起来。

###### 开发者层面

- 合并多次对DOM和样式的修改，下面的代码可能会触发三次重绘（虽然浏览器可能为我们作了优化）。

  ```javascript
  const el = document.getElementById('test');
  el.style.padding = '5px';
  el.style.borderLeft = '1px';
  el.style.borderRight = '2px'
  ```

- 修改DOM时使用文档片段（fragment），构建完成之后再注入DOM中。
- 使用绝对定位时一些复杂的效果脱离文档流。



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
<html lang="en">
  <head>
    <meta charset="UTF-8">
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
<html lang="en">
  <head>
    <meta charset="UTF-8">
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

#### HTML5 History API

**history** 对象表示当前窗口首次使用以来用户的导航历史记录。因为 history 是 window 的属性，所以每个 window 都有自己的 history 对象。出于安全考虑，这个对象不会暴露用户访问过的 URL，但可以通过它在不知道实际 URL 的情况下前进和后退。

##### go()

`go()`方法可以在用户历史记录中沿任何方向导航，可以前进也可以后退。这个方法只接收一个参数，
这个参数可以是一个整数，表示前进或后退多少步。负值表示在历史记录中后退（类似点击浏览器的“后
退”按钮），而正值表示在历史记录中前进（类似点击浏览器的“前进”按钮）。  

```javascript
// 后退一页
history.go(-1);
// 前进一页
history.go(1);
// 前进两页
history.go(2);  
```

##### back()  / forward()  

它们是`go()`的语法糖。

```javascript
// 后退一页
history.back();
// 前进一页
history.forward();
```

##### pushState()

`pushState()`方法执行后，状态信息就会被推到历史记录中，浏览器地址栏也会改变以反映新的相对 URL（可以想象成一个“假的”URL）。  

因为 `pushState()`会创建新的历史记录，所以也会相应地启用“后退”按钮。此时单击“后退”按钮，就会触发 window 对象上的 popstate 事件。

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

# TODO

SEO(搜索引擎优化)

event loop

浏览器底层（并发）



