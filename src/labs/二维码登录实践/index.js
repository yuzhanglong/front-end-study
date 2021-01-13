const Koa = require('koa');
const WebSocket = require('ws');
const Router = require("koa-router");
const qr = require('qr-image')
const {initWebsocket} = require("./ws/ws");

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
myRouter.post("/login_by_code", (ctx) => {
  const token = "231";
  const codeId = "21332";

  // 过期验证逻辑，略去
  const isExpired = false;

  // token 有效性验证，略去
  const isTokenSuccess = true;

  if (wss) {
    // 可以在 wss.clients 中找到相应的结果
    const clients = wss.clients;
    // 找到对应的 ws 客户端
    let targetClient = [...clients].find((client) => client.uid === codeId);
    if (targetClient) {
      // 发送新的 token 给客户端，客户端利用它来执行登录
      targetClient.send("new token");
      ctx.body = {
        message: "登录成功"
      }
    }
  } else {
    ctx.body = {
      message: "登录失败"
    }
  }
});

const app = new Koa();

app.use(myRouter.routes());

const server = app.listen(8000, () => {
  console.log("your project is running successfully!");
});

wss = new WebSocket.Server({
  server: server
});

initWebsocket(wss);
