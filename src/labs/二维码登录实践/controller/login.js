/*
 * File: login.js
 * Description: 登录路由
 * Created: 2021-1-14 12:52:06
 * Author: yuzhanglong
 * Email: yuzl1123@163.com
 */

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

