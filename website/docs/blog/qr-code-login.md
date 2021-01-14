# 基于 Koa 和 WebSocket 实现二维码登录

扫描二维码登录这个场景经常遇到，本文将介绍二维码登录的实现原理，并使用 Koa 框架实现一个简单的二维码登录 DEMO。

## 二维码登录原理

二维码登录的实现流程如下，红色线表示 WebSocket 连接，白色线表示 http(s) 连接：

![](http://cdn.yuzzl.top/blog/20210113224809.png)

可以看出，基于 **WebSocket**，我们可以弥补 http 无状态的缺陷，让服务端和客户端建立一次持久的连接，而这个连接状态的改变和用户的扫描情况、确认情况息息相关。

整个过程的核心主要有下面三个：

- 唯一标识 **uuid**：通过这个 uuid，我们可以将客户端和移动端进行关联，客户端和移动端持有相同的 uuid，这是它们互相关联、登录结果能正确分发的基础。另外，为了保证安全性，这个 uuid 应该有**过期时间**。
- 移动端已存在的 **token**：通过 token 有效性的验证，我们可以知道是哪个用户在扫码。
- 二维码：是 uuid 的载体。

:::tip

你也可以用 **ajax 轮询**来替代 Websocket，前者是服务端向客户端主动推送状态，后者是客户端定期向服务端查询状态）.
:::

## 实现二维码登录

下面我们将以 Koa 框架为基础，来实现二维码登录。

### 接口约定

**获取 TOKEN**（模拟手机上的账号密码登录）

方法：GET

路径：`http://localhost:8000/login_by_code`

参数样例：无（实际开发中为用户名、密码、验证码等必要的登录信息，这里做出了简化）

返回样例：

```json
{
  "message": "登录成功~",
  "data": {
    "token": "TOKEN"
  }
}
```

**获取二维码**

方法：GET

路径：`http://localhost:8000/login_qr_code/ + uuid`

参数样例：无（实际开发中为用户名、密码、验证码等必要的登录信息，这里做出了简化）

**登录及确认登录**（模拟手机上的账号密码登录）

method：POST

路径：`http://localhost:8000/login_by_code`

参数样例：

```json
{
  "token": "手机端 TOKEN",
  "uuid": "通过二维码获取的 UUID ab3c9fda-0698-4280-b819-a6d49d25b252"
}
```

返回样例：

**扫码成功时**

```json
{
  "message": "用户已经扫描了二维码，请点击确认按钮以确认登录"
}
```

**登录确认时**

```json
{
  "message": "登录成功~"
}
```

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

- 用户点击某个按钮，弹出扫码框，和服务端建立 websocket 连接。
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

![](http://cdn.yuzzl.top/blog/20210114160149.png)

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

这个模块是处理全局 websocket 服务的：

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

**ws/wsLogin.js**

这个模块是登录相关的 WebSocket 业务逻辑处理，属于核心代码：

- 调用 `initWebSocket()`，传入全局 websocket 对象，我们可以为它绑定相关事件。
- 基于 `loginMessageHandler` 对象，我们可以根据客户端发来的消息匹配相应的业务逻辑操作函数。
- 暴露 `sendData` 方法，在合适的时候可以让服务端向客户端发送消息，例如“用户已扫码”之类。

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

## 基于 Jest 的单元测试

下面我们用测试框架 Jest 来测试我们的二维码登录服务，当然，你也可以选择手工测试。

