---
date: 2021-3-21

tags:

- 前端基础
- 计算机网络
---

# 前端计算机网络基础(应用层)

[[toc]]

## DNS -- 域名系统

### 概念

DNS 解析其实就是用你的域名来定位真正的 IP 地址，就像拜访朋友要先知道别人家怎么走一样，Internet 上当一台主机要访问另外一台主机时，必须首先获知其地址，TCP/IP 中的 IP 地址是由四段以“.”分开的数字组成，记起来总是不如名字那么方便，所以，就采用了**DNS**来管理名字和 IP 的对应关系。

### 流程

DNS 解析本质上是一个**迭代查询**和**递归查询**的过程，假设我的主机要访问`docs.yuzzl.top`这个网站，需要获得它的 IP，来看看这个 DNS 解析流程：

![](http://cdn.yuzzl.top/blog/20201108194011.png)

### DNS 缓存

当某 DNS 服务器接收到一个应答之后，它会将这个内容缓存到服务器上。还是上面的图，假如另一台电脑使用同样的本地 DNS 服务器访问`docs.yuzzl.top`，那么本地 DNS 服务器查询缓存，然后直接返回`docs.yuzzl.top`的 IP 地址（如果没有过期的话）。

## CDN

### 概念

CDN 的全称是 Content Delivery Network，即**内容分发网络**。

它指的是一组分布在各个地区的服务器。这些服务器存储着数据的副本，因此服务器可以根据哪些服务器与用户距离最近，来满足数据的请求。

### CDN 流程

用户通过浏览器指令检索一个特定的资源时，CDN 必须截获这个请求，以便能够：

- 确定此时适合用于该客户的 CDN 服务器集群。
- 将客户的请求重定向到该集群的某一台服务器。

结合下面这个真实案例，我们来了解一下 CDN 的整个流程，假定一个内容提供商**yuzzl.top**，雇用了第三方 CDN 公司**七牛云**来向他的客户提供资源。在 **yuzzl.top** 的网页上，每个资源都被指定了一个 URL。

![](http://cdn.yuzzl.top/blog/20201101223427.png)

接下来我们来介绍一下**集群选择策略**，这是任何 CDN 部署的核心。

### 集群选择策略

集群的选择对应了上图的**步骤 4**，在 CDN 权威服务器得知了本地 DNS 服务器的地址之后，CDN 需要基于该地址选择一个适当的集群。CDN 一般采用专用的集群选择策略。常见的方案有：

**地理上最为临近**

使用商用地理位置数据库，每个本地 DNS 的 IP 地址都映射到某个地理位置。CDN 通过数据库的查询找到地理位置上最为接近的集群。

**实时测量**

**地理上最为临近**的方案对于众多用户来说表现得很好，但是对于部分用户，不一定起到最好效果。因为**地理最邻近的集群可能并不是沿着网络路径最近的集群**。另外，还有可能用户的本地 DNS 的地理位置距离客户的位置比较大，导致我们地理位置的判断失去意义。

CDN 可以通过对其集群和客户之间的时延和丢包性能执行周期性的实时测量。

针对实时测量，我们有以下几种常见方案：

- 让 CDN 能够让它的集群周期性地向位于全世界的所有本地 DNS 发送探测分组（例如 ping 报文）。缺点在于部分本地 DNS 拒绝来自 CDN 服务器的探测。
- 利用近期客户和 CDN 服务器的交互信息来进行测量。缺点在于时不时地需要将用户重定向到优化过的集群。从而导致性能下降。

### CNAME -- 真实名称记录

如果你从 CDN 供应商处购买 CDN 服务，那么他们会让你给你的域名添加一条 **CNAME** 记录，如下图：

![](http://cdn.yuzzl.top/blog/20210328230829.png)

CNAME 记录用于将一个域名（同名）映射到另一个域名（真实名称），域名解析服务器遇到 CNAME 记录会以映射到的目标重新开始查询。

例如下面的记录：

```plain
NAME                    TYPE   VALUE
--------------------------------------------------
bar.example.com.        CNAME  foo.example.com.
foo.example.com.        A      192.0.2.23
````

当要查询 `bar.example.com` 的 A 记录时，域名解析器会查到对应的 CNAME 记录，即 `foo.example.com`，随即开始查询该域名的 A 记录，查到 `192.0.2.23` 则返回结果。

## 代理

代理服务器本身不生产内容，它作为一个中继转发上下游的请求。

### 正向代理

![](http://cdn.yuzzl.top/blog/20210322114604.png)

- 1 由于某些原因（例如防火墙）无法访问 3
- 此时我们通过 2（正向代理）访问 3
- 正向代理做到了隐藏客户端的身份
- 一些抓包工具的原理就是利用了正向代理服务

### 反向代理

![](http://cdn.yuzzl.top/blog/20210322114749.png)

- 1 访问 2，2 将 1 的请求转发给 3
- 反向代理可以用来隐藏服务器的身份、实现负载均衡

## WebSocket

### 经典轮询

很多网站为了实现推送技术，所用的技术都是 **Ajax 轮询**。

轮询是在特定的的时间间隔（如每 1 秒），由浏览器对服务器发出 HTTP 请求，然后由服务器返回最新的数据给客户端的浏览器。

这种传统的模式带来很明显的缺点，即浏览器需要不断的向服务器发出请求，然而 HTTP 请求可能包含较长的头部，其中真正有效的数据可能只是很小的一部分，显然这样会浪费很多的带宽等资源。

### 介绍

Web Socket 的目标是通过一个长时连接实现与服务器全双工、双向的通信，一般的 HTTP 协议只能通过客户端主动向服务端发起请求，而 WebSocket 可以主动向客户端发送信息。只要**通过一次握手**，就可以实现双向推送。它和 HTTP Server 共享同一 port。

### 和 HTTP 协议的区别

下面的内容来自https://tools.ietf.org/html/rfc6455#section-1.7

- The WebSocket Protocol is an independent **TCP-based** protocol.
- Its **only relationship** to HTTP is that its **handshake is interpreted by HTTP servers** as an Upgrade request.
- By default, the WebSocket Protocol uses **port 80** for regular WebSocket connections and **port 443** for WebSocket connections tunneled over Transport Layer Security (TLS) *[RFC2818]*.

> WebSocket 协议是一个独立的基于 TCP 的协议。
>
> 它和 HTTP 协议的唯一关系是它的握手流程是通过 HTTP 协议来实现的。
>
> 在默认情况下，WebSocket 协议使用 80 端口（常规模式）或者 443 端口（安全传输模式下）

### 实现细节

#### 打开连接-握手

若要实现 WebSocket 协议，首先需要浏览器主动发起一个**HTTP 请求**, 下面是一个请求报文示例，多余的内容被省略。

```http
GET wss://xxxxx.com/ HTTP/1.1
Upgrade: WebSocket
Sec-WebSocket-Key: CENNKlxp+sYCvqt3pK2T1A==
```

请求头中有一个 `Upgrade` 字段，内容为 `WebSocket`, 用于改变 HTTP 协议版本或换用其他协议，这里显然是换用了 WebSocket 协议。

还有一个最重要的字段 `Sec-WebSocket-Key`，这是一个随机的经过 `base64` 编码的字符串，像密钥一样用于服务器和客户端的握手过程。

服务器接收到来自客户端的`upgrade`请求，便会将请求头中的`Sec-WebSocket-Key`字段提取出来，追加一个固定的“魔串”：`258EAFA5-E914-47DA-95CA-C5AB0DC85B11`，并进行`SHA-1`
加密，然后再次经过`base64`编码生成一个新的 key，作为响应头中的`Sec-WebSocket-Accept`字段的内容返回给浏览器。

一旦浏览器接收到来自服务器的响应，便会解析响应中的`Sec-WebSocket-Accept`字段，与自己加密编码后的串进行匹配，一旦匹配成功，便有建立连接的可能了。

下面是一个响应报文案例，多余的内容被省略：

```http request
HTTP/1.1 101 Switching Protocols
Upgrade: WebSocket
Sec-WebSocket-Version: 13
Connection: Upgrade
Sec-WebSocket-Accept: 7d3Wyy9mojKdk/q0gH2A/xvwNV8=
```

### 实践：WebSocket API

主流浏览器支持 `WebSocket`：

```html
<!DOCTYPE html>
<html lang='en'>
<head>
  <meta charset='UTF-8'>
  <title>Title</title>
</head>
<body>
<script>
  const SOCKET_URL = "wss://socket.idcd.com:1443";
  const WebSocket = () => {
    // 浏览器会在初始化 WebSocket 对象之后立即创建连接
    let socket = new WebSocket(SOCKET_URL);

    // socket 连接成功 发送信息
    socket.onopen = () => {
      socket.send("hello world");
    }
  }
  WebSocket();
</script>
</body>
</html>
```

浏览器开发者模式抓包：

![](http://cdn.yuzzl.top/blog/20201101224250.png)

来看一下发起连接的报文：

- 状态码为**101**。101 表示等待，服务器收到请求，需要**请求者继续执行操作**。经过这样的请求- 响应处理后，两端的 WebSocket 连接握手成功, 后续就可以进行 TCP 通讯了。
- **Sec-WebSocket-Version** 表示 WebSocket 的版本。如果服务端不支持该版本，需要返回一个 Sec-WebSocket-Versionheader，里面包含服务端支持的版本号。
- **Sec-WebSocket-Key** 对应服务端响应头的 Sec-WebSocket-Accept，由于没有同源限制，WebSocket 客户端可任意连接支持 WebSocket 的服务。这个就相当于一个钥匙一把锁，便于连接的区分。
- **Sec-WebSocket-Accept**: 用来告知服务器愿意发起一个 WebSocket 连接， 值根据客户端请求头的 Sec-WebSocket-Key 计算出来。

尝试发送一条消息：

```javascript
socket.send("hello world");
```

![](http://cdn.yuzzl.top/blog/20201101224312.png)

### 实践：基于 WebSocket 实现二维码登录

:::tip

由于此部分内容较长，现抽离到单独的文章中，请[点我](http://localhost:8080/posts/2021/01/15/qr-code-login.html)查看。
:::

## HTTP

### 常见请求方法

**OPTIONS**

HTTP 的 OPTIONS 方法用于获取目的资源所支持的通信选项，其用法有二种：

- 检测服务器所支持的请求方法

![](http://cdn.yuzzl.top/blog/20210321193708.png)

- CORS 中的预检请求

CORS 通过一种叫**预检请求**（preflighted request）的服务器验证机制，允许使用自定义头部、除 GET 、POST、HEAD（这三个也被称为**简单请求**） 之外的方法，以及不同请求体内容类型。在要发送涉及上述某种高级选项的请求时，会先向服务器发送一个“预检”请求。这个请求使用 OPTIONS 方法发送并包含以下头部：

- **Origin**：与简单请求相同

- **Access-Control-Request-Method**：请求希望使用的方法

- **Access-Control-Request-Headers**：（可选）要使用的逗号分隔的自定义头部列表。

例如下面的请求报文(省略了一部分无关头部)：

```http request
OPTIONS /user/user_info HTTP/1.1
Host: 47.106.202.255:8081
Connection: keep-alive
Accept: */*
Access-Control-Request-Method: GET
Access-Control-Request-Headers: authorization,loading
Origin: http://yuzzl.top
```

在这个请求发送之后，服务器确认是否允许，然后在响应头部附带以下内容：

- **Access-Control-Allow-Origin**：支持请求的路径。
- **Access-Control-Allow-Methods**：允许的方法（逗号分隔的列表）。
- **Access-Control-Allow-Headers**：服务器允许的头部（逗号分隔的列表）。
- **Access-Control-Max-Age**：缓存预检请求的秒数 (预检请求也是有缓存机制的)。

例如下面的响应报文：

```http request
Access-Control-Allow-Credentials: true
Access-Control-Allow-Headers: authorization, loading
Access-Control-Allow-Methods: POST,GET,PUT,OPTIONS,DELETE
Access-Control-Allow-Origin: http://docs.yuzzl.top
Access-Control-Max-Age: 3600
```

### 状态码

#### 分类

HTTP 状态码由三个十进制数字组成，第一个十进制数字定义了状态码的类型，后两个数字没有分类的作用。HTTP 状态码共分为 5 种类型：

| 分类 | 分类描述                                           |
| :--- | :------------------------------------------------- |
| 1**  | **临时响应**，服务器收到请求，需要**请求者继续执行操作**   |
| 2**  | **成功**，操作被成功接收并处理                     |
| 3**  | **重定向**，需要进一步的操作以完成请求             |
| 4**  | **客户端错误**，请求包含语法错误或无法完成请求     |
| 5**  | **服务器错误**，服务器在处理请求的过程中发生了错误 |

#### 常见的状态码

| HTTP 状态码 | 英文名称      | 中文描述                                                     |
| :--------- |------------------------ | :----------------------------------------------------------- |
| 100 | Continue | 客户端征询服务器状况，如果服务器同意可以返回 100，同时客户端可以继续请求。常见的案例是在上传大文件的情况下，客户端先上传请求头部，交给服务端校验权限、文件名称合法性，如果符合，返回 100，客户端再传输剩下的数据。否则返回 400 之类的错误，直接终止服务 |
| 101 | Switching Protocol | 服务器应客户端升级协议的请求对协议进行切换，例如上面提到的 WebSocket |
| 200        | OK          | 请求成功                       |
| 301 | Permanently Moved | 该资源已经永久性转移 |
| 302 | Temporarily Moved | 该资源暂时性转移 |
| 304 | Not Modified      | 所请求的资源未修改，和缓存机制有关 |
| 400 | Bad Request | 客户端请求的语法错误，服务器无法理解 |
| 401 | Unauthorized      | 请求要求用户的身份认证                   |
| 403 | Forbidden | 服务器理解请求客户端的请求，但是拒绝执行此请求 |
| 404 | Not Found | 服务器无法根据客户端的请求找到资源 |
| 405 | Method Not Allowed | 客户端请求中的方法被禁止 |
| 500 | Internal Server Error | 服务器内部错误，无法完成请求      |
| 501 | Not Implemented | 此请求方法不被服务器支持且无法被处理。       |

### 缓存

:::tip

缓存的部分略去，请参考这篇文章[谈谈前端性能优化](http://blog.yuzzl.top/posts/2020/12/22/frontend-better-performance.html#%E5%90%88%E7%90%86%E5%88%A9%E7%94%A8%E7%BC%93%E5%AD%98)
:::

## HTTPS

在讲 HTTPS 之前，首先提几个概念：

### 对称加密

**描述**

需要对加密和解密使用相同密钥的加密算法。

例如：

用户甲: 明文 ABCD  **-- 加密 -->**  密文 CDEF

用户乙: 密文 CDEF  **-- 解密 -->**  明文 ABCD

我们可以发现，对称加密需要对加密和解密使用相同密钥（可以看成加解密的指令）的加密算法。

**优缺点**

效率高，但发送者和接收者在互相对话之前，一定要有一个共享的保密密钥，难以解决密钥配送问题。

### 非对称加密

**描述**

非对称加密算法需要两个密钥：公开密钥（public key，简称公钥）和私有密钥（private key，简称私钥）。

公钥与私钥是一对，如果用公钥对数据进行加密，只有用对应的私钥才能解密。因为加密和解密使用的是两个不同的密钥，所以这种算法叫作非对称加密算法。

![](http://cdn.yuzzl.top/blog/20210329103808.png)

例如下面的流程：

![](http://cdn.yuzzl.top/blog/20210329111133.png)

**优缺点**

有较高的安全性，但效率低。

**中间人攻击**

如果遭遇了中间人攻击，那么公钥将可能是伪造的。

来看下面的案例，它演示了中间人攻击的流程：

![](http://cdn.yuzzl.top/blog/20210329111621.png)

不难看出，公钥的合法性是个问题，如何验证公钥的合法性？我们需要使用证书。

### 签名

签名就是在信息的后面再加上一段内容，可以证明信息没有被修改过，怎么样可以达到这个效果呢？

一般是对信息做一个 hash 计算得到一个 hash 值，注意，这个过程是不可逆的，也就是说无法通过 hash 值得出原来的信息内容。

在把信息发送出去时，把这个 hash 值加密后做为一个签名和信息一起发出去。

接收方在收到信息后，会重新计算信息的 hash 值，并和信息所附带的 hash 值(解密后)进行对比，如果一致，就说明信息的内容没有被修改过，因为这里 hash 计算可以保证不同的内容一定会得到不同的 hash 值，所以只要内容一被修改，根据信息内容计算的 hash 值就会变化。

### 证书

- 对于请求方来说，它怎么能确定它所得到的公钥一定是从目标主机那里发布的，而且没有被篡改过呢？亦或者请求的目标主机本本身就从事窃取用户信息的不正当行为呢？

- 这时候，我们需要有一个权威的值得信赖的第三方机构(一般是由政府审核并授权的机构)来统一对外发放主机机构的公钥，只要请求方这种机构获取公钥，就避免了上述问题的发生。

#### 颁发过程

- 用户首先**产生自己的密钥对**，并将公共密钥及部分个人身份信息传送给认证中心。

- 认证中心将发给用户一个**数字证书**，该证书内包含**用户的个人信息和他的公钥信息**，同时还附有认证中心的**签名信息**(根证书私钥签名)。

#### 如何验证

浏览器/操作系统默认内置了 CA 的根证书。根证书包含了这个 CA 的公钥。

如果:

- 证书颁发的机构是伪造的：浏览器不认识，直接认为是危险证书

- 如果伪造的证书颁发的机构是确实存在的，于是根据 CA 名，找到对应内置的 CA 根证书、CA 的公钥。用 CA 的公钥，对伪造的证书的摘要进行解密，发现解不了, 认为是危险证书。

- 对于篡改的证书，使用 CA 的公钥对数字签名进行解密得到摘要 A,然后再根据签名的 Hash 算法计算出证书的摘要 B，对比 A 与 B，若相等则正常，若不相等则是被篡改过的。

- 证书可在其过期前被吊销。较新的浏览器如 Chrome、Firefox、Opera 和 Internet Explorer 都实现了在线证书状态协议（OCSP）以排除这种情形：浏览器将网站提供的证书的序列号通过 OCSP 发送给证书颁发机构，后者会告诉浏览器证书是否还是有效的。

### 通信流程

通信流程主要分为三个阶段：

- TCP 三次握手
- TLS 连接
- HTTP 请求和响应

其中，TLS 的基本步骤如下所示：

![](http://cdn.yuzzl.top/blog/20210402114239.png)

接下来，我们详细描述此过程。

**Client Hello**

- TLS 的版本号
- 客户端支持的加密组件（算法、秘钥长度）
- 一个随机数（Client Random）

**Server Hello**

- TLS 版本号
- 选中的加密组件（从客户端的加密组件列表中选择出来）
- 一个随机数（Server Random）

**Certificate**

- 传输被 CA 签名过的服务器的公钥证书

**Server Key Exchange**

- 传输 ECDHE 算法（一种密钥交换算法）的其中一个参数 `Server Params`，注意该值使用了服务端私钥进行签名。

**Server Hello Done**

- 告知客户端，协商过程结束，此时客户端拿到了证书，客户端会验证证书的合法性（具体方案上面已经介绍过）
- 另外，客户端和服务器之间**通过明文**共享了 `Client Random` 、`Server Random`、`Server Params`。

**Client Key Exchange**

传输用来实现 ECDHE 的第二个参数 `Client Params`，在此之后，双方拥有了 ECDHE 的两个参数。

**Change Cipher Spec**

告知服务端，之后的通信使用 ECDHE 算法生成的密钥进行加密。

**Finished**

- 包含连接至今全部报文的整体校验值（摘要），加密之后发送给服务器
- 这次握手协商是否成功，要以服务器是否能够正确解密该报文作为判定标准

**Change Cipher Spec && Finished**

- 服务器确认传输无误，握手结束。

## HTTP2

### HTTP 1.x 的缺陷

- 同一时间，一个连接只能对应一个请求
- 针对同一个域名，大多数浏览器允许同时最多 6 个并发连接
- 只允许客户端主动发起请求
- 一个请求只能对应一个响应
- 同一个会话的多次请求中，头信息会被重复传输，增加传输开销
- 如果使用 Cookie，增加的开销有时会达到上千字节

### 二进制分帧

HTTP2 在应用层和传输层直接增加了一个二进制分帧层：

![](http://cdn.yuzzl.top/blog/20210402094457.png)

- `HTTP/2` 会将所有传输的信息分割为更小的消息和帧（frame）,并对它们采用二进制格式的编码。
- `HTTP1.x` 的首部信息会被封装到 HEADER frame，而相应的 Request Body 则封装到 DATA frame 里面
- 相对 HTTP/1（文本协议），HTTP/2 二进制协议解析效率高、没有冗余字段，体积更小。

### 多路复用

多路复用允许同时通过单一的 HTTP/2 连接发起多重的请求-响应消息，这解决了针对同一个域名的浏览器请求并发限制，以及一个连接只能对应一个请求的问题。

基本原理是客户端/服务器将 HTTP 消息分解为互不依赖的帧，然后交错发送，最后再在另一端把它们重新组装起来。

![](http://cdn.yuzzl.top/blog/20210402101104.png)

### 服务端推送 Server Push

服务器可以对一个客户端请求发送多个响应。除了对最初请求的响应外，服务器还可以向客户端推送额外资源，而无需客户端额外明确地请求。

下面是我写的一个 Server Push DEMO，基于 Koa，有兴趣可以看看：

[点我查看 DEMO](https://github.com/yuzhanglong/front-end-study/blob/main/src/labs/serverPush/README.md)

### 头部压缩

上面说到，HTTP/1 下，同一个会话的多次请求中，头信息会被重复传输，增加传输开销。

HTTP/2 使用 HPACK 压缩请求头和响应头，可以极大减少头部开销，进而提高性能。

实现原理简介：

![](http://cdn.yuzzl.top/blog/20210402105932.png)

在客户端和服务器之间维护一份相同的静态字典、一份动态字典、一份静态哈夫曼码表：

- 整个头部键值对都在字典中，可以采用一个字符表示，上图 Request Headers 的 `:method GET` 匹配到了静态表的 `:method GET`，对应 `2`，那么我们只需传输 2 即可。
- 头部名称在字典中，值不在，key 转换为一个固定值来表示，value 利用哈夫曼编码转换。同时我们更新动态字典，后续传输此内容就符合第一种情况。
- 对于其他键值对，例如上面的 `custom-hdr`，直接用哈夫曼编码编解码。

下图展示了该静态字典的一部分，更多内容请参阅[这里](https://httpwg.org/specs/rfc7541.html#rfc.section.A)：

![](http://cdn.yuzzl.top/blog/20210402110930.png)