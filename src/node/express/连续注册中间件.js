const express = require("express");

const app = express();

// 连续注册中间件

app.use((req, res, next) => {
  console.log("middleware 01");
  next();
});

app.get('/home', (req, res, next) => {
  console.log("home and method middleware 01");
  next();
}, (req, res, next) => {
  console.log("home and method middleware 02");
  next();
}, (req, res, next) => {
  console.log("home and method middleware 03");
  res.end("hello~");
});


app.listen(8000, () => {
  console.log("success!");
});
