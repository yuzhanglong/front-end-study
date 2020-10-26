# 前端基础

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

### 压缩

### 本地存储

### CDN

网站上的静态资源css、js、图片应该全部使用**cdn**分发。

关于CDN详细的内容请参照计算机网络篇 -- CDN。



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

尽量不要使用 onLoad="onload('{{data}}')"、onClick="go('{{action}}')" 这种拼接内联事件的写法。在 JavaScript 中通过 .addEventlistener() 事件绑定会更安全。