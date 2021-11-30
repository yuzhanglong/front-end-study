/*
 * File: index.js
 * Description: WebSocket 初始化配置
 * Created: 2021-1-14 12:51:07
 * Author: yuzhanglong
 * Email: yuzl1123@163.com
 */

const WebSocket = require('ws')

// WebSocket Server 对象
let wss = null

// 创建 wss 对象，我们可以把 Koa 的 Server 的对象传入，来共享端口，
// 第一次创建时，我们会结果赋值给将上面的 wss，
// 这样的好处是方便在接口层中获取 wss 对象，匹配正确的客户端
const createWss = (server) => {
  if (!wss) {
    wss = new WebSocket.Server({
      server: server,
    })
    return wss
  } else {
    return wss
  }
}

// 获取 wss 对象
const getWss = () => {
  return wss
}

module.exports = {
  createWss: createWss,
  getWss: getWss,
}
