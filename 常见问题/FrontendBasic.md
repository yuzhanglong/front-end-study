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

## Cookie/Session/localstorage

## 性能优化

## MVVM/MVC

## 浏览器的缓存方式