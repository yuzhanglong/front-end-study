const express = require("express");

const app = express();

const myPromise = () => new Promise((resolve) => {
  setTimeout(() => {
    resolve("promise resolved!");
  }, 2000);
});


app.use(async (req, res, next) => {
  console.log("middleware 01");
  await next();
  console.log("after middleware 01 next");
  res.end("hello~");
});


app.use(async (req, res, next) => {
  const timeRes = await myPromise();
  console.log(timeRes);
});


app.listen(8001, () => {
  console.log("listening!");
});