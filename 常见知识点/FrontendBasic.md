# 前端基础

https://zhuanlan.zhihu.com/p/24764131

https://developers.google.com/web/fundamentals/performance/optimizing-content-efficiency/optimize-encoding-and-transfer?hl=zh-cn

https://developers.google.com/web/fundamentals/performance/optimizing-content-efficiency/eliminate-downloads?hl=zh-cn

https://developers.google.com/web/fundamentals/performance/optimizing-content-efficiency/javascript-startup-optimization?hl=zh-cn



https://developer.mozilla.org/zh-CN/docs/Learn/HTML/Multimedia_and_embedding/Responsive_images

## 跨源资源共享(CORS)

### 总述

通过 **XHR** 进行 **Ajax 通信**的一个主要限制是跨源安全策略。默认情况下， XHR 只能访问与发起请求的页面在同一个域内的资源。这个安全限制可以防止某些恶意行为。

### CORS

跨源资源共享（ CORS， Cross-Origin Resource Sharing）定义了浏览器与服务器如何实现跨源通信。CORS 背后的基本思路就是使用自定义的 HTTP 头部允许浏览器和服务器相互了解，以确实请求或响应应该成功还是失败。  

请求在发送时会有一个额外的头部**Origin**，如下面所示：

```
Origin: http://docs.yuzzl.top
```

它包括了**协议**、**域名**、**端口**，以便服务器确定是否提供响应。

如果服务器**决定响应请求**，那么它也会发送一个头部：

```
Access-Control-Allow-Origin: http://docs.yuzzl.top
```

如果资源是公开的，那么可以如此做:

```
Access-Control-Allow-Origin: *
```

如果没有这个头部，或者有但源不匹配，则表明不会响应浏览器请求。否则，服务器就会处理这个请求。  

### 预检请求  

CORS 通过一种叫**预检请求**（ preflighted request）的服务器验证机制，允许使用自定义头部、除 GET 和 POST 之外的方法，以及不同请求体内容类型。在要发送涉及上述某种高级选项的请求时，会先向服务器发送一个“预检”请求。这个请求使用 OPTIONS 方法发送并包含以下头部。  

- **Origin**：与简单请求相同  

- **Access-Control-Request-Method**：请求希望使用的方法  

- **Access-Control-Request-Headers**：（可选）要使用的逗号分隔的自定义头部列表。  

例如下面的请求报文(省略了一部分无关头部)：

```
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

```
Access-Control-Allow-Credentials: true
Access-Control-Allow-Headers: authorization, loading
Access-Control-Allow-Methods: POST,GET,PUT,OPTIONS,DELETE
Access-Control-Allow-Origin: http://docs.yuzzl.top
Access-Control-Max-Age: 3600
```

我们可以发现，预检请求也是有缓存机制的。

### 凭据请求

默认情况下，跨源请求不提供凭据（ cookie、 HTTP 认证和客户端 SSL 证书）。可以通过将withCredentials 属性设置为 true 来表明请求会发送凭据。如果服务器允许带凭据的请求，那么可以在响应中包含如下 HTTP 头部：

```
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

JSONP 调用是通过动态创建`<script>`元素并为 src 属性指定跨域 URL 实现的

```javascript
function handleResponse(response) {
    console.log(`
    You're at IP address ${response.ip}, which is in
    ${response.city}, ${response.region_name}`);
}
let script = document.createElement("script");
script.src = "http://freegeoip.net/json/?callback=handleResponse";
document.body.insertBefore(script, document.body.firstChild);
```

- JSONP 是从不同的域拉取可执行代码。如果这个域并不可信，则可能在响应中加入恶意内容。
  此时除了完全删除 JSONP 没有其他办法。在使用不受控的 Web 服务时，一定要保证是可以信任的。  

- 不好确定 JSONP 请求是否失败。虽然 HTML5 规定了`<script>`元素的 `onerror` 事件
  处理程序，但还没有被任何浏览器实现。为此，开发者经常使用计时器来决定是否放弃等待响应。  

## 性能优化

### 缓存

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

##### 实践

来看这个案例。（来自MDN）

![](../assets/images/响应式图片-1.jpg)

![](../assets/images/响应式图片-2.jpg)

![](../assets/images/响应式图片-3.jpg)



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

![](../assets/images/GZIP流程.jpg)

- 浏览器请求url，并在request header中设置属性accept-encoding:gzip。表明浏览器支持gzip，例如下图：

  ![](../assets/images/GZIP_请求.jpg)

- 服务器收到浏览器发送的请求之后，判断浏览器是否支持gzip，如果支持gzip，则向浏览器传送压缩过的内容，不支持则向浏览器发送未经压缩的内容。

  如果支持，response headers返回**content-encoding:gzip**

  ![](../assets/images/GZIP_响应.jpg)

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

## MVVM/MVC



## HTTP和HTTPS



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

前端采用拼接 HTML 的方法比较危险，如果框架允许，使用 createElement、setAttribute 之类的方法实现。或者采用比较成熟的渲染框架，如 Vue/React 等。

#### 利用模板引擎

开启模板引擎自带的 HTML 转义功能。

- jQuery、模板引擎等多采用 模板 + encode(数据) 的方式生成 html，因而：

  - 需要程序员根据上下文（js/css/html属性/...）仔细选择 encode 规则，心智负担重。

  - 可能存在遗漏encode，或采用了不正确的 encode 规则。

- Vue、React 则将模板/jsx解析为树，在 renderer 里调用 DOM API，因而：

  - 减少了 encode 的必要性，减轻程序员心智负担。

  - 减少了 encode 操作，减少了 XSS 隐患。

- 但 Vue、React 也不是万能的，依然需要警惕：
  - prerender / SSR 的 hydrate 过程会生成 html ，需要小心测试其中是否有 XSS 漏洞
  - dangerouslySetInnerHTML、onload=字符串、href=字符串 等，都有可能造成 XSS 漏洞。

#### 避免内联事件

尽量不要使用 `onLoad="onload('{{data}}')"`、`onClick="go('{{action}}')"` 这种拼接内联事件的写法。在 JavaScript 中通过 `.addEventlistener()`事件绑定会更安全。