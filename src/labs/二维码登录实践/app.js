/*
 * File: index.js
 * Description: 入口文件
 * Created: 2021-1-14 12:49:11
 * Author: yuzhanglong
 * Email: yuzl1123@163.com
 */

const Koa = require('koa');
const bodyParser = require('koa-bodyparser');
const {initWebsocket} = require("./ws/wsLogin");
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

module.exports = app;