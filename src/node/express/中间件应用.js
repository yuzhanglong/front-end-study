// 实现 json 解析中间件
const express = require("express");

const app = express();

app.use(((req, res, next) => {
  if (req.headers['content-type'] === 'application/json') {
    req.on('data', (data) => {
      req.body = JSON.parse(data.toString());
      next();
    });

    req.on("end", () => {
      next();
    })
  } else {
    next();
  }
}));

app.post('/login', ((req, res, next) => {
  console.log(req.body);
  res.end("hello~");
}));


app.listen(8000, () => {
  console.log("success!");
});
