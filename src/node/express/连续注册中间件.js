const express = require("express");

const app = express();

app.use(/* 中间件 M1 */ (req, res, next) => {
  console.log("middleware 01 in app.use");
  next();
}, /* 中间件 M2 */ (req, res, next) => {
  console.log("middleware 02 in app.use");
  next();
});

app.get('/home', /* 中间件 M3 */ (req, res, next) => {
  console.log("home and get method middleware 01");
  next();
}, /* 中间件 M4 */ (req, res, next) => {
  console.log("home and get method middleware 02");
  next();
}, /* 中间件 M5 */ (req, res, next) => {
  console.log("home and get method middleware 03");
  res.end("hello world");
});


app.listen(8000, () => {
  console.log("your project is running successfully!");
});

