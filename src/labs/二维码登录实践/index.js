const Koa = require('koa');
const WebSocket = require('ws');
const Router = require("koa-router");
const qr = require('qr-image')
const bodyParser = require('koa-bodyparser');
const {initWebsocket} = require("./ws/ws");
const cors = require('koa2-cors')
const myRouter = new Router();

let wss;

// 首页
myRouter.get("/", (ctx) => {
  ctx.body = "hello world!";
});

// 登录
myRouter.get("/login_qr_code/:uid", (ctx) => {
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

// 执行登录
myRouter.post("/login_by_code", (ctx, next) => {
  // 用户的 token 来自手机端
  const token = ctx.request.body["token"];

  // codeId
  const codeId = ctx.request.body["codeId"];

  if (wss) {
    // 可以在 wss.clients 中找到相应的结果
    const clients = wss.clients;
    // 找到对应的 ws 客户端
    let targetClient = [...clients].find((client) => client.qrCodeCondition.uid === codeId);
    if (targetClient) {
      if (targetClient.qrCodeCondition.status === 0) {
        targetClient.send(JSON.stringify({
          status: "success",
          data: {
            uid: codeId
          },
          type: "SCANNED"
        }));
        targetClient.qrCodeCondition.status++;
        ctx.body = {
          message: "用户已经扫描了二维码，请点击确认按钮以确认登录"
        }
      } else if (targetClient.qrCodeCondition.status === 1) {
        // 派发新的token
        targetClient.send(JSON.stringify({
          status: "success",
          data: {
            uid: codeId
          },
          type: "SUCCESS"
        }));

        ctx.body = {
          message: "登录成功~",
          data: {
            token: "NEW TOKEN"
          }
        }
        targetClient.qrCodeCondition.status++;
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

const app = new Koa();

app.use(cors());
app.use(bodyParser());
app.use(myRouter.routes());

const server = app.listen(8000, () => {
  console.log("your project is running successfully!");
});

wss = new WebSocket.Server({
  server: server
});

initWebsocket(wss);
