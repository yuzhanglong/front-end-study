const Koa = require('koa');
const WebSocket = require('ws');
const Router = require("koa-router");
const qr = require('qr-image')
const bodyParser = require('koa-bodyparser');
const {initWebsocket} = require("./ws/ws");
const cors = require('koa2-cors');
const {sendData} = require("./ws/ws");
const myRouter = new Router();
const {verify, generateToken} = require('./utils/jwt');

const JWT_SECRET = "KEY";

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

// 获取 TOKEN，这里就不考虑数据库、用户名/密码，略去手工登录操作
// 而是直接通过 yzl520 这个 USER_ID 生成 TOKEN
myRouter.get("/get_token", (ctx) => {
  const USER_ID = "yzl520";
  const token = generateToken(USER_ID);
  ctx.body = {
    message: "登录成功~",
    data: {
      token: token
    }
  }
});

// 执行登录
myRouter.post("/login_by_code", (ctx, next) => {
  // 用户的 token 来自手机端
  const token = ctx.request.body["token"];
  const tokenData = verify(token, JWT_SECRET);

  // codeId
  const uuid = ctx.request.body["uuid"];
  if (wss && tokenData) {
    // 可以在 wss.clients 中找到相应的结果
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
