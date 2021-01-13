const uuid = require("uuid");

const initWebsocket = (wss) => {
  wss.on("connection", (ws, req) => {
    console.log(`[SERVER] connection` + uuid.v4());
    // 接收到数据
    ws.on('message', (msg) => {
      console.log(`[SERVER] Received: ${msg}`);
      // 发送数据
      const fn = messageUtil[msg];
      if (fn) {
        ws.send(fn(ws));
      } else {
        ws.send("bad command!");
      }
    });
  });
}


const messageUtil = {
  "get_code": (ws) => {
    const uid = uuid.v4();
    ws.loginUid = uid;
    return JSON.stringify({
      status: "success",
      data: {
        uid: uid
      },
      type: "CODE_ID"
    });
  }
}

module.exports = {
  initWebsocket: initWebsocket
}