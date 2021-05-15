---
date: 2021-1-15

tags:

- Labs
- Node.js
---

# 基于 Koa 和 WebSocket 实现二维码登录

扫描二维码登录这个场景经常遇到，本文将介绍二维码登录的实现原理，并使用 Koa 框架实现一个简单的二维码登录 DEMO。

你可以[点击这里](https://github.com/yuzhanglong/yzl-blog/tree/main/src/labs/%E4%BA%8C%E7%BB%B4%E7%A0%81%E7%99%BB%E5%BD%95%E5%AE%9E%E8%B7%B5)查看这个 DEMO 的源代码。

本文大纲：
[[toc]]

## 二维码登录原理

二维码登录的实现流程如下图，其中红色线表示 **WebSocket** 连接，白色线表示 **http(s)** 连接：

<a data-fancybox title="" href="http://cdn.yuzzl.top/blog/20210113224809.png">![](http://cdn.yuzzl.top/blog/20210113224809.png)</a>

可以看出，基于 **WebSocket**，我们可以弥补 http 无状态的缺陷，让服务端和客户端建立一次持久的连接，而这个连接传输的信息和用户的扫描情况、确认情况息息相关。

整个过程的核心主要有下面三个：

- 唯一标识 **uuid**：通过这个 uuid，我们可以将客户端和移动端进行关联，客户端和移动端持有相同的 uuid，这是它们互相关联、登录结果能正确分发的基础。另外，为了保证安全性，这个 uuid 应该有**过期时间**。
- 移动端已存在的 **token**：通过 token 有效性的验证，我们可以知道是哪个用户在扫码。
- 二维码：是 uuid 的载体。

:::tip

你也可以用 **ajax 轮询**来替代 WebSocket，前者是服务端向客户端主动推送状态，后者是客户端定期向服务端查询状态）.

为了方便起见，下面的代码中没有去考虑 uuid 过期时间这个问题，在实际开发中，你可以利用 **redis** 来进行过期时间的设定，也可以利用 JWT 将 uuid 生成一个**有期限的 token** 发送给客户端。

:::

## 实现二维码登录

正如上图所示，二维码的登录流程很容易想到，也很好理解。但是真正写起代码来还是会有点小坑，下面我们将以 Koa 框架为基础，来实现二维码登录。

### 实现效果

**Step 1 唤起扫码框**

<a data-fancybox title="" href="http://cdn.yuzzl.top/blog/20210115105846.png">![](http://cdn.yuzzl.top/blog/20210115105846.png)</a>

**Step 2 获取 TOKEN，模拟手机端登录**

<a data-fancybox title="" href="http://cdn.yuzzl.top/blog/20210115105923.png">![](http://cdn.yuzzl.top/blog/20210115105923.png)</a>

**Step 3 模拟扫码操作，为了方便体验，这里直接使用客户端显示的 UUID，略去了将二维码转换成 uuid 的操作**

<a data-fancybox title="" href="http://cdn.yuzzl.top/blog/20210115110026.png">![](http://cdn.yuzzl.top/blog/20210115110026.png)</a>

此时，客户端收到用户已经扫码的消息，要求用户确认：

<a data-fancybox title="" href="http://cdn.yuzzl.top/blog/20210115110106.png">![](http://cdn.yuzzl.top/blog/20210115110106.png)</a>

**Step 4 用户再次点击确认按钮**

<a data-fancybox title="" href="http://cdn.yuzzl.top/blog/20210115110139.png">![](http://cdn.yuzzl.top/blog/20210115110139.png)</a>

此时，客户端收到服务端用户确认的消息和新的 TOKEN，并显示登录成功的信息，此时我们可以用这个 TOKEN 来调用其他需要登录权限的接口。

<a data-fancybox title="" href="http://cdn.yuzzl.top/blog/20210115110216.png">![](http://cdn.yuzzl.top/blog/20210115110216.png)</a>

### 接口约定

**获取 TOKEN**（模拟手机上的账号密码登录）

- 方法：GET

- 路径：`http://localhost:8000/login_by_code`

- 参数样例：无（实际开发中为用户名、密码、验证码等必要的登录信息，这里做出了简化）

- 返回样例：

```json
{
  "message": "登录成功~",
  "data": {
    "token": "TOKEN"
  }
}
```

**获取二维码**

- 方法：GET

- 路径：`http://localhost:8000/login_qr_code/ + uuid`

- 参数样例：无（实际开发中为用户名、密码、验证码等必要的登录信息，这里做出了简化）

**登录及确认登录**（模拟手机上的账号密码登录）

- 方法：POST

- 路径：`http://localhost:8000/login_by_code`

- 参数样例：

```json
{
  "token": "手机端 TOKEN",
  "uuid": "通过二维码获取的 UUID ab3c9fda-0698-4280-b819-a6d49d25b252"
}
```

- 返回样例：

扫码成功时

```json
{
  "message": "用户已经扫描了二维码，请点击确认按钮以确认登录"
}
```

登录确认时

```json
{
  "message": "登录成功~"
}
```

**登录业务 WebSocket**

- 路径：`ws://localhost:8000`

- 返回内容格式

```json
{
  "status": "表示状态",
  "data": {
    "描述": "返回数据"
  }
}
```

- 消息内容

| 消息内容        | 方向                |   描述             |
| ----------- | -------------------- |------------------------------------------- |
| GET_CODE   | client -> server     |  获取 uuid，可以通过这个 uuid 生成二维码并让手机端扫码 |
| 用户在扫码时触发   | server -> client     |  data 的 type 字段应该为 SCANNED   |
| 用户在扫码时触发   | server -> client     |  data 的 type 字段应该为 SUCCESS，并且会携带 token 字段，可以利用这个 token 调取其它接口   |

- 示例

用户获取 uuid 时响应：

<a data-fancybox title="" href="http://cdn.yuzzl.top/blog/20210115100819.png">![](http://cdn.yuzzl.top/blog/20210115100819.png)</a>

用户扫码之后响应：

<a data-fancybox title="" href="http://cdn.yuzzl.top/blog/20210115100724.png">![](http://cdn.yuzzl.top/blog/20210115100724.png)</a>

用户确认时响应：

<a data-fancybox title="" href="http://cdn.yuzzl.top/blog/20210115100740.png">![](http://cdn.yuzzl.top/blog/20210115100740.png)</a>

### mobile 端

扫码、确认的操作位于手机端，它主要负责以下的操作：

- 模拟登录，扫码时手机必须处于登录状态，点击登录，我们会向服务器请求登录的 token（在实际情况下模拟了手机上输入账号密码并登录）
- 模拟扫码，为了方便起见，我们简化了将二维码图片转化成 uuid 的步骤。
- 执行确认。

代码如下：

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <title>用户手机端 -- 模拟扫码</title>
    <script src="https://cdn.bootcdn.net/ajax/libs/axios/0.21.0/axios.min.js"></script>
  </head>
  <body>
    <h3>Step 1 手机登录</h3>
    <h4>手机必须处于登录状态，这里我们会向服务端请求一个 TOKEN，拿到 TOKEN 则代表登录成功</h4>
    <button id="get-token-button">
      获取 TOKEN（模拟手机登录）
    </button>
    <div id="token-container">

    </div>


    <h3>Step 2 模拟扫码操作</h3>
    <h4>手机测试不方便，这里请输入二维码界面显示的 UUID，省去了将二维码转换成 uuid 的步骤</h4>
    <label>
      <input placeholder="请输入控制台打印的 uuid" id="uuid-input">
    </label>
    <button id="scan-code-button">
      模拟扫码操作
    </button>

    <h3>Step 3 执行确认操作</h3>
    <h4>在扫码成功时下面的按钮会被激活，点击则登录成功</h4>
    <button id="confirm-button">
      确认登录
    </button>

    <script>
      const scanCodeButton = document.getElementById("scan-code-button");
      const input = document.getElementById("uuid-input");
      const getTokenButton = document.getElementById("get-token-button");
      const tokenContainer = document.getElementById("token-container");
      const confirmButton = document.getElementById("confirm-button");

      // 在扫码登录按钮被单击时，提交用户的 token 和 二维码解析而来的 uuid
      scanCodeButton.addEventListener("click", () => {
        axios.post("http://localhost:8000/login_by_code", {
          "token": tokenContainer.innerText,
          "uuid": input.value
        }).then(res => {
          console.log(res);
        })
      });

      // 模拟了手机端的登录，实际开发中
      getTokenButton.addEventListener("click", () => {
        axios.get("http://localhost:8000/get_token")
            .then(res => {
              tokenContainer.innerHTML = res.data.data.token;
              console.log(res.data.data.token);
            })
      });


      // 确认按钮
      confirmButton.addEventListener("click", () => {
        axios.post("http://localhost:8000/login_by_code", {
          "token": tokenContainer.innerText,
          "uuid": input.value
        }).then(res => {
          console.log(res);
        })
      });
    </script>
  </body>
</html>
```

### 客户端（用户 PC）

客户端的职责如下：

- 用户点击某个按钮，弹出扫码框，和服务端建立 WebSocket 连接。
- 基于 WebSocket，获得服务端发来的 uuid，利用该 uuid 生成二维码。
- 在用户确认时，接收到 token，然后调用需要权限的接口。（转变为已登录状态）。

代码如下：

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <title>Client -- 扫码登录页面</title>
  </head>
  <body>
    <div>
      扫码登录测试
    </div>
    <div>
      <button id="show-code-button">
        点我唤起扫码框
      </button>
      <button id="hide-code-button">
        点我关闭扫码框
      </button>
      <div id="code">
      </div>
    </div>

    <script>
      // DOM 元素
      const showCodeButton = document.getElementById("show-code-button");
      const codeContainer = document.getElementById("code");
      const hideCodeButton = document.getElementById("hide-code-button");

      // 必要的变量
      let uuid = null;
      let codeWebsocket = null;

      showCodeButton.addEventListener("click", () => {
        showCode();
      });

      hideCodeButton.addEventListener("click", () => {
        codeContainer.innerHTML = "";
      });

      // 展示扫码框
      const showCode = () => {
        // 建立 websocket 服务
        if (codeWebsocket) {
          codeWebsocket.close();
        }
        codeWebsocket = new WebSocket("ws://localhost:8000");
        codeWebsocket.onmessage = (e) => {
          const res = JSON.parse(e.data);
          const handlerFn = messageHandler[res.data.type];
          // 匹配到相应的函数，执行之
          if (typeof handlerFn === "function") {
            handlerFn(res);
          }
        }
        // 连接建立成功
        codeWebsocket.onopen = () => {
          // 发送消息，请求随机 id
          codeWebsocket.send("GET_CODE");
        }
      }

      // websocket 消息处理
      const messageHandler = {
        // 获得 codeId 接下来我们要生成二维码
        "CODE_ID": (res) => {
          const imgElement = document.createElement("img");
          uuid = res.data.uuid;
          imgElement.src = `http://localhost:8000/login_qr_code/${uuid}`;
          codeContainer.innerHTML = uuid;
          codeContainer.appendChild(imgElement);
        },
        // 二维码被扫描，等待客户端确认
        "SCANNED": () => {
          codeContainer.innerHTML =
              `<div>
              <div>扫描成功，请点击确认按钮以登录</div>
             </div>`
        },
        // 登录成功，保存获得的 token
        "SUCCESS": () => {
          console.log("登录成功，在这里，开发者可以将 TOKEN 保存到 localstorage 中，然后执行用户相关的请求~");
          codeContainer.innerHTML =
              `<div>
              <div>登录成功~</div>
             </div>`
          codeWebsocket.close();
        }
      }
    </script>
  </body>
</html>
```

### 服务端

服务端我们采用 Koa 框架，这也是二维码登录的核心。其目录结构如下：

<a data-fancybox title="" href="http://cdn.yuzzl.top/blog/20210114160149.png">![](http://cdn.yuzzl.top/blog/20210114160149.png)</a>

**jwt.js**

该模块属于工具模块，主要是 TOKEN 的校验和解码：

```javascript
// 验证 TOKEN 的有效性
const verify = (token, secret) => {
  try {
    return jwt.verify(token, secret);
  } catch (e) {
    return false;
  }
}

// 生成 TOKEN
const generateToken = (uid, exp = 1000) => {
  return jwt.sign({
    userId: uid
  }, "KEY", {
    expiresIn: exp
  });
}

module.exports = {
  verify,
  generateToken
}
```

**ws/index.js**

这个模块是处理全局 WebSocket 服务的：

```javascript
/*
 * File: index.js
 * Description: WebSocket 初始化配置
 * Created: 2021-1-14 12:51:07
 * Author: yuzhanglong
 * Email: yuzl1123@163.com
 */

const WebSocket = require('ws');

// WebSocket Server 对象
let wss = null;

// 创建 wss 对象，我们可以把 Koa 的 Server 的对象传入，来共享端口，
// 第一次创建时，我们会结果赋值给将上面的 wss，
// 这样的好处是方便在接口层中获取 wss 对象，匹配正确的客户端
const createWss = (server) => {
  if (!wss) {
    wss = new WebSocket.Server({
      server: server
    })
    return wss;
  } else {
    return wss;
  }
}

// 获取 wss 对象
const getWss = () => {
  return wss;
}


module.exports = {
  createWss: createWss,
  getWss: getWss
}
```

**login.js**

登录相关的接口路由。

前面的图中说到，在用户扫码时，手机端会携带 uuid 调用 `/login_by_code` 接口，如果通过 uuid 匹配到正确的客户端？实际上，ws 库为多客户端连接提供了很好的 API。 在创建 websocket
服务时，我们可以拿到一个 `WebSocket.Server` 对象：

```javascript
const wss = new WebSocket.Server({
  server: server
})
```

wss 里面有个 clients 属性，它是一个集合，每当有一个用户通过 WebSocket 连接，就会创建一个 WebSocket 对象，并放到这个集合里面。

我们只需要在用户连接时，将 uuid 添加到 这个 WebSocket 对象，就可以实现 uuid -- WebSocket 对象（客户端）的匹配。在接口中我们就可以查询到正确的客户端：

```javascript
// 找到对应的 ws 客户端
let targetClient = [...clients].find((client) => client.loginCondition.uuid === uuid);
```

```javascript
const Router = require("koa-router");
const qr = require('qr-image')
const {generateToken, verify} = require("../utils/jwt");
const {sendData} = require("../ws/wsLogin");
const {getWss} = require("../ws");

const loginRouter = new Router();


// 首页
loginRouter.get("/", (ctx) => {
  ctx.body = "hello world!";
});

// 通过 uuid 生成携带 uuid 的二维码
loginRouter.get("/login_qr_code/:uid", (ctx) => {
  const uid = ctx.request.params.uid;

  // 对 uid 过期验证逻辑，略去
  const isExpired = false;

  if (!uid || isExpired) {
    ctx.body = {
      message: "二维码已过期"
    }
  } else {
    ctx.response.set('content-type', 'image/png');
    ctx.body = qr.image(uid, {
      size: 12,
      margin: 1
    });
  }
});

// 获取 TOKEN，这里就不考虑数据库、用户名/密码，略去手工登录操作
// 而是直接通过 yzl520 这个 USER_ID 生成 TOKEN
loginRouter.get("/get_token", (ctx) => {
  const USER_ID = "yzl520";
  const token = generateToken(USER_ID);
  ctx.body = {
    message: "登录成功~",
    data: {
      token: token
    }
  }
});

// 登录及确认登录（模拟手机上的账号密码登录）
loginRouter.post("/login_by_code", (ctx) => {
  // 用户的 token 来自手机端
  const token = ctx.request.body["token"];
  const tokenData = verify(token);

  // codeId
  const uuid = ctx.request.body["uuid"];
  const wss = getWss();
  if (wss && wss.clients && tokenData) {
    // 可以在 wss.clients 中找到相应的客户端
    const clients = wss.clients;

    // 找到对应的 ws 客户端
    let targetClient = [...clients].find((client) => client.loginCondition.uuid === uuid);
    if (targetClient) {
      if (targetClient.loginCondition.status === 0) {
        sendData(targetClient, "ok", {
          uuid: uuid,
          type: "SCANNED"
        });
        targetClient.loginCondition.status++;
        ctx.body = {
          message: "用户已经扫描了二维码，请点击确认按钮以确认登录"
        }
      } else if (targetClient.loginCondition.status === 1) {
        sendData(targetClient, "ok", {
          uuid: uuid,
          type: "SUCCESS",
          token: generateToken(tokenData.userId)
        });

        ctx.body = {
          message: "登录成功~"
        }

        targetClient.loginCondition.status++;
      } else {
        ctx.body = {
          message: "二维码已经失效！"
        }
      }
      return;
    }
  }
  ctx.body = {
    message: "登录失败"
  }
});


module.exports = {
  loginRouter: loginRouter
}
```

**ws/wsLogin.js**

这个模块是登录相关的 WebSocket 业务逻辑处理，属于核心代码：

- 调用 `initWebSocket()`，传入全局 WebSocket 对象，我们可以为它绑定相关事件。
- 基于 `loginMessageHandler` 对象，我们可以根据客户端发来的消息匹配相应的业务逻辑操作函数。
- 暴露 `sendData` 方法，在合适的时候可以让服务端向客户端发送消息，例如“用户已扫码”之类。

另外，uuid 和 WebSocket 对象（相应的客户端）也在这个模块绑定：

```javascript
ws.loginCondition = {
  uuid: uid,
  status: 0
}
```

代码如下：

```javascript
/*
 * File: ws.js
 * Description: WebSocket 消息处理
 * Created: 2021-1-14 12:51:32
 * Author: yuzhanglong
 * Email: yuzl1123@163.com
 */

const uuid = require("uuid");

// 发送消息
const sendData = (client, status, data) => {
  if (client && client.send) {
    client.send(JSON.stringify({
      status: status,
      data: data
    }));
  }
}

// 服务初始化
const initWebsocket = (wss) => {
  wss.on("connection", (ws) => {
    console.log(`[SERVER] connection`);
    // 接收到数据
    ws.on('message', (msg) => {
      console.log(`[SERVER] Received: ${msg}`);
      // 发送数据
      const fn = loginMessageHandler[msg];
      if (fn) {
        fn(ws);
      } else {
        ws.send("bad command!");
      }
    });
  });
}

// 处理登录消息，根据客户端发来的消息匹配相应的业务逻辑操作函数
const loginMessageHandler = {
  "GET_CODE": (ws) => {
    const uid = uuid.v4();
    console.log("获取二维码----" + uid);
    ws.loginCondition = {
      uuid: uid,
      status: 0
    }
    sendData(ws, "ok", {
      uuid: uid,
      type: "CODE_ID"
    });
  }
}

module.exports = {
  initWebsocket: initWebsocket,
  sendData: sendData
}
```

**app.js**

该模块是整个项目的入口，启动了 Koa 的服务、注册了一系列的中间件，启动登录的 WebSocket 服务，这里 WebSocket 服务和 Koa 是共用端口的。

```javascript
/*
 * File: index.js
 * Description: 入口文件
 * Created: 2021-1-14 12:49:11
 * Author: yuzhanglong
 * Email: yuzl1123@163.com
 */

const Koa = require('koa');
const bodyParser = require('koa-bodyparser');
const {initWebsocket} = require("./ws/ws");
const cors = require('koa2-cors');
const {createWss} = require("./ws");
const {loginRouter} = require("./controller/login");

// 创建 Koa App
const app = new Koa();

// 处理跨域
app.use(cors());
// bodyParser 用来获取请求体参数
app.use(bodyParser());
// 登录相关路由
app.use(loginRouter.routes());


// 监听端口
const server = app.listen(8000, () => {
  console.log("your project is running successfully!");
});

// websocket 初始化
const wss = createWss(server);
initWebsocket(wss);
```

## 参考资料

知乎问题，[微信扫描二维码登录网页是什么原理，前后两个事件是如何联系的？](https://www.zhihu.com/question/20368066)