# 计算机网络

参考资料：

- https://www.runoob.com/html/html5-websocket.html
- https://blog.csdn.net/wx_962464/article/details/51043069
- https://www.zhihu.com/question/338939262/answer/778573750
- https://github.com/abbshr/abbshr.github.io/issues/22
- https://github.com/kaola-fed/blog/issues/271
- https://zhuanlan.zhihu.com/p/26757514
- https://www.upyun.com/tech/article/227/%E4%B8%80%E6%96%87%E8%AF%BB%E6%87%82%20HTTP%2F2%20%E7%89%B9%E6%80%A7.html
- https://www.zhihu.com/question/24853633

### SSL的过程

上面说到，SSL在传输层与应用层之间对网络连接进行加密。

在发送方，SSL接收应用层的数据，对数据进行加密，然后把加密的数据送往TCP套接字。

在接收方，SSL从TCP套接字读取数据，解密后把数据交给应用层。

浏览器在访问web服务器的资源时，安装了**证书**的web服务器会交给浏览器一个公钥，之后浏览器生成一个对称加密秘钥，然后用web服务器的公钥进行加密，web服务器可以对这个对称加密秘钥进行解密。在此之后，浏览器和web服务器就通过这个对称加密秘钥来通信。






## DOS攻击

**DOS**是Denial of Service的简称，即拒绝服务，造成DoS的攻击行为被称为DoS攻击，其目的是使计算机或网络无法提供正常的服务。最常见的DoS攻击有计算机网络宽带攻击和连通性攻击。*[百度百科]*

### 类型

大多数DOS攻击包括以下三种类型：

- 弱点攻击。利用被攻击主机所提供服务程序或传输协议的本身实现缺陷，反复发送畸形的攻击数据引发系统错误的分配大量系统资源，使主机处于挂起状态甚至死机。
- 带宽洪泛。制造大流量无用数据，造成通往被攻击主机的网络拥塞，使被攻击主机无法正常和外界通信。
- 连接洪泛。攻击者在目标主机中创建大量的半开或者全开TCP连接，该主机由于这些伪造的连接陷入困境，并停止接收合法的连接。

> 类似的，还有一种攻击叫做**DDOS**，是指处于不同位置的多个攻击者同时向一个或数个目标发动攻击，或者一个攻击者控制了位于不同位置的多台机器并利用这些机器对受害者同时实施攻击。由于攻击的发出点是分布在不同地方的，这类攻击称为**分布式拒绝服务攻击**，其中的攻击者可以有多个。

### 防范



## WebSocket

### 经典轮询

很多网站为了实现推送技术，所用的技术都是 **Ajax 轮询**。轮询是在特定的的时间间隔（如每1秒），由浏览器对服务器发出HTTP请求，然后由服务器返回最新的数据给客户端的浏览器。这种传统的模式带来很明显的缺点，即浏览器需要不断的向服务器发出请求，然而HTTP请求可能包含较长的头部，其中真正有效的数据可能只是很小的一部分，显然这样会浪费很多的带宽等资源。

### 介绍

Web Socket的目标是通过一个长时连接实现与服务器全双工、双向的通信，一般的HTTP协议只能通过客户端主动向服务端发起请求，而webSocket可以主动向客户端发送信息。只要**通过一次握手**，就可以实现双向推送。它和HTTP Server共享同一port。

### 和HTTP协议的区别

下面的内容来自https://tools.ietf.org/html/rfc6455#section-1.7

- The WebSocket Protocol is an independent **TCP-based** protocol.
- Its **only relationship** to HTTP is that its **handshake is interpreted by HTTP servers** as an Upgrade request.
- By default, the WebSocket Protocol uses **port 80** for regular WebSocket connections and **port 443** for WebSocket connections tunneled over Transport Layer Security (TLS) *[RFC2818]*.

> websocket协议是独立于基于TCP的协议的。
>
> 它和HTTP协议的唯一关系是它的握手流程是通过HTTP协议来实现的。
>
> 在默认情况下，websocket协议使用80端口（常规模式）或者443端口（安全传输模式下）

### 实现细节

#### 打开连接-握手

若要实现WebSocket协议，首先需要浏览器主动发起一个**HTTP请求**, 下面是一个请求报文示例，多余的内容被省略。

```http
GET wss://xxxxx.com/ HTTP/1.1
Upgrade: websocket
Sec-WebSocket-Key: CENNKlxp+sYCvqt3pK2T1A==
```

请求头中有一个`Upgrade`字段，内容为`websocket`, 用于改变HTTP协议版本或换用其他协议，这里显然是换用了Websocket协议。还有一个最重要的字段`Sec-WebSocket-Key`，这是一个随机的经过`base64`编码的字符串，像密钥一样用于服务器和客户端的握手过程。服务器君接收到来自客户端的`upgrade`请求，便会将请求头中的`Sec-WebSocket-Key`字段提取出来，追加一个固定的“魔串”：`258EAFA5-E914-47DA-95CA-C5AB0DC85B11`，并进行`SHA-1`加密，然后再次经过`base64`编码生成一个新的key，作为响应头中的`Sec-WebSocket-Accept`字段的内容返回给浏览器。一旦浏览器接收到来自服务器的响应，便会解析响应中的`Sec-WebSocket-Accept`字段，与自己加密编码后的串进行匹配，一旦匹配成功，便有建立连接的可能了（因为还依赖许多其他因素）。

下面是一个响应报文案例，多余的内容被省略。

```http
HTTP/1.1 101 Switching Protocols
Upgrade: websocket
Sec-WebSocket-Version: 13
Connection: Upgrade
Sec-WebSocket-Accept: 7d3Wyy9mojKdk/q0gH2A/xvwNV8=
```

### 实践：webSocket API 

主流浏览器支持`websocket`

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <title>Title</title>
  </head>
  <body>
    <script>
      const SOCKET_URL = "wss://socket.idcd.com:1443";
      const webSocket = () => {
        // 浏览器会在初始化 WebSocket 对象之后立即创建连接
        let socket = new WebSocket(SOCKET_URL);

        // socket 连接成功 发送信息
        socket.onopen = () => {
          socket.send("hello world");
        }
      }
      webSocket();
    </script>
  </body>
</html>
```

浏览器开发者模式抓包：

![](http://cdn.yuzzl.top/blog/20201101224250.png)

来看一下发起连接的报文：

- 状态码为**101**。101表示等待，服务器收到请求，需要**请求者继续执行操作**。经过这样的请求-响应处理后，两端的WebSocket连接握手成功, 后续就可以进行TCP通讯了。
- **Sec-WebSocket-Version** 表示websocket的版本。如果服务端不支持该版本，需要返回一个Sec-WebSocket-Versionheader，里面包含服务端支持的版本号。
- **Sec-WebSocket-Key** 对应服务端响应头的Sec-WebSocket-Accept，由于没有同源限制，websocket客户端可任意连接支持websocket的服务。这个就相当于一个钥匙一把锁，避免多余的，无意义的连接。
- **Sec-WebSocket-Accept**: 用来告知服务器愿意发起一个websocket连接， 值根据客户端请求头的Sec-WebSocket-Key计算出来。

尝试发送一条消息：

```javascript
socket.send("hello world");
```

![](http://cdn.yuzzl.top/blog/20201101224312.png)

### 实践：实现一个Websocket服务器

**TODO**




## HTTP版本区别

### 1.0 VS 1.1

#### 长连接

**HTTP1.1**支持**长连接**和请求的流水线处理，在一个TCP连接上可以传送多个HTTP请求和响应，减少了建立和关闭连接的消耗和延迟，在HTTP1.1中默认开启长连接`keep-alive`，一定程度上弥补了HTTP1.0每次请求都要创建连接的缺点。HTTP1.0需要使用`keep-alive`参数来告知服务器端要建立一个长连接。

#### 带宽优化

- 
- 

**HTTP1.1**支持只发送`header`信息，如果服务器认为客户端有权限请求服务器，则返回100，客户端接收到100才开始把请求body发送到服务器。

#### 缓存处理

- **HTTP1.0**：If-Modified-Since, Expires

- **HTTP1.1**：Entity tag，If-Unmodified-Since, If-Match, If-None-Match

> 关于缓存的详细内容参考：<a href="#HTTP缓存">HTTP缓存</a>

### 1.1 VS 2.0

#### 二进制分帧

HTTP/1 的请求和响应报文，都是由起始行，首部和实体正文（可选）组成，各部分之间以文本换行符分隔。HTTP/2 将请求和响应数据分割为**更小的帧**，并且它们采用二进制编码。   

#### 多路复用

##### HTTP1.x多路并行的弊端

下图中（HTTP1.x）红色部分因为浏览器域名链接数的个数限制导致等待。

![](http://cdn.yuzzl.top/blog/20201101224805.png)

##### HTTP2.x实现多流并行

在 HTTP/2 中，有了二进制分帧之后，HTTP/2 不再依赖 TCP 链接去实现多流并行了，在 HTTP/2中：

- 同域名下所有通信都在**单个连接上**完成。
- 单个连接可以承载任意数量的双向数据流
- 数据流以消息的形式发送，而消息又由一个或多个帧组成，多个帧之间可以乱序发送，因为根据帧首部的流标识可以重新组装。

##### 我们已经有了keep-alive为什么还要多路复用？

- HTTP 1.1做不到真实的**并行** ---- HTTP 1.1 基于**串行**文件传输数据，因此这些请求必须是**有序的**，所以实际上我们只是节省了建立连接的时间，而获取数据的时间并没有减少。HTTP/2 引入二进制数据帧和流的概念，其中帧对数据进行顺序标识，这样浏览器收到数据之后，就可以按照序列对数据进行合并，而不会出现合并后数据错乱的情况。同样是因为有了序列，服务器就可以并行的传输数据。

##### 性能提升的原因

- 同个域名只需要占用一个 TCP 连接，消除了因多个 TCP 连接而带来的延时和内存消耗。
- 单个连接上可以并行交错的请求和响应，之间互不干扰。
- 在HTTP/2中，每个请求都可以带一个31bit的优先值，0表示最高优先级， 数值越大优先级越低。有了这个优先值，客户端和服务器就可以在处理不同的流时采取不同的策略，以最优的方式发送流、消息和帧。

##### 图解多路复用

![](http://cdn.yuzzl.top/blog/v2-b1e608ddb7493608efea3e76912aabe1_b.png)



#### 头部压缩

**HTTP2.0**使用**HPACK算法**对header的数据进行压缩，这样数据体积小了，在网络上传输就会更快。而HTTP/1.x每次请求，都会携带大量冗余头信息，浪费了很多带宽资源。

如下图，请求一发送了所有的头部字段，第二个请求则只需要发送差异数据，这样可以减少冗余数据，降低开销。

![](http://cdn.yuzzl.top/blog/20201101224957.png)

#### 服务端推送（server push）

服务端可以在发送页面HTML时主动推送其它资源，而不用等到浏览器解析到相应位置，发起请求再响应。例如服务端可以主动把JS和CSS文件推送给客户端，而不需要客户端解析HTML再发送这些请求。服务端可以主动推送，客户端也有权利选择接收与否。如果服务端推送的资源已经被浏览器缓存过，浏览器可以通过发送RST_STREAM帧来拒收。主动推送也遵守同源策略，服务器不会随便推送第三方资源给客户端。

## TCP

### TCP三次握手

#### 过程分析

TCP连接是通过主机A和主机B之间的三次握手建立的。下面以文字加上抓包截图的方式来正确理解整个过程。

![](http://cdn.yuzzl.top/blog/20201105184801.png)

- 第一次握手：主机A向主机B发送一个报文，表示A处的TCP层希望和B的TCP层建立连接。这个报文也被称为**SYN消息**（synchronize，同步的简写）。另外A会随机选择一个初始序号（`seq=client_isn`）一起交给B。

  ![](http://cdn.yuzzl.top/blog/20201105191649.png)



- 第二次握手：B收到数据包后由标志位`SYN=1`知道A请求建立连接，B将**标志位**`SYN`和`ACK`都置为1，`ack = client_isn + 1`, 随机产生一个值`seq = server_isn`。

![](http://cdn.yuzzl.top/blog/20201105191818.png)

- 第三次握手：A收到确认后，检查ack是否为`client_isn + 1`，ACK是否为1，如果正确则将标志位ACK置为1，`ack = server_isn + 1`，并将该数据包发送给B，B检查ack是否为`server_isn + 1`，ACK是否为1，如果正确则连接建立成功，完成三次握手，随后Client与Server之间可以开始传输数据了。

![](http://cdn.yuzzl.top/blog/20201105191908.png)

#### 为什么需要三次握手？

##### 握手握了什么？

我们需要知道TCP握手握的是什么 -- **通信双方数据原点的序列号**。

- A --> B  `SYN` + `A序列号`
- B --> A  `SYN` + `B序列号`（同时记录A的序列号到本地）
- A --> B （同时记录B的序列号到本地）

经过三次握手，双方都可以获得对面的序列号并存到本地。并且都确认自己收到了对方的同步信号。

##### 如果是两次握手呢？

- A --> B SYN + A序列号
- B --> A SYN + B 的序列号

两人的序列号达成了一致，但是**B不知道A能否接收到自己的同步信号**，如果这个同步信号丢失了，A和B就B的初始序列号将无法达成一致。

### TCP四次挥手

#### 过程分析

![](http://cdn.yuzzl.top/blog/20201105190758.png)

- 第一次挥手：客户端设置seq和 ACK ,向服务器发送一个 FIN(终结)报文段。此时，客户端进入 FIN_WAIT_1状态，表示客户端没有数据要发送给服务端了。

![](http://cdn.yuzzl.top/blog/20201105192914.png)

- 第二次挥手，服务端收到了客户端发送的 FIN 报文段，向客户端回了一个 ACK 报文段。

![](http://cdn.yuzzl.top/blog/20201105193031.png)

- 第三次挥手，服务端向客户端发送FIN报文段，请求关闭连接，同时服务端进入LAST_ACK状态。

![](http://cdn.yuzzl.top/blog/20201105193406.png)

- 第四次挥手，客户端收到服务端发送的 FIN 报文段后，向服务端发送 ACK 报文段, 然后客户端进入 TIME_WAIT状态。服务端收到客户端的 ACK 报文段以后，就关闭连接。此时，客户端等待2MSL（指一个片段在网络中最大的存活时间）后依然没有收到回复，则说明服务端已经正常关闭，这样客户端就可以关闭连接了。

![](http://cdn.yuzzl.top/blog/20201105193510.png)

#### 为什么需要四次挥手？

第一次挥手，表示主动方不会再发送数据报文，但是主动方还是可以接收的。

第二次挥手被动还有可能有数据报文需要发送，所以需要先发送ACK报文，告诉主动方“我知道你想断开连接的请求了”。这样主动方便不会因为没有收到应答而继续发送断开连接的请求（即FIN报文）。

所以关键问题在于有可能**被动方接收到断开连接的请求时，手里还有活儿没做完**。

### TCP报文首部格式

![](http://cdn.yuzzl.top/blog/20201105214030.png)

**源端口和目的端口 :** 各占两个字节，分别写入源端口号和目的端口号。

**序号 ：** 占4个字节；用于对字节流进行编号，例如序号为 301，表示第一个字节的编号为 301，如果携带的数据长度为 100 字节，那么下一个报文段的序号应为 401。

**确认号 ：** 占4个字节；期望收到的下一个报文段的序号。例如 B 正确收到 A 发送来的一个报文段，序号为 501，携带的数据长度为 200 字节，因此 B 期望下一个报文段的序号为 701，B 发送给 A 的确认报文段中确认号就为 701。

**数据偏移 ：**占4位；指的是数据部分距离报文段起始处的偏移量，实际上指的是**首部的长度**。

**确认 ACK ：** 当 `ACK=1`时确认号字段有效，否则无效。TCP 规定，在连接建立后所有传送的报文段都必须把 ACK 置 1。

**同步 SYN** ：在连接建立时用来同步序号。当 `SYN=1`，`ACK=0` 时表示这是一个连接请求报文段。若对方同意建立连接，则响应报文中 `SYN=1`，`ACK=1`。

**终止 FIN ：** 用来释放一个连接，当 `FIN=1` 时，表示此报文段的发送方的数据已发送完毕，并要求释放连接。
**窗口 ：** 占2字节；窗口值作为接收方让发送方设置其发送窗口的依据。之所以要有这个限制，是因为接收方的数据缓存空间是有限的。
**检验和：** 占2个字节；检验和字段检验的范围包括首部和数据这两个部分。在计算检验和时，在TCP报文段的前面加上12字节的伪首部。
