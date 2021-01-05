const express = require("express");

const app = express();


app.use((req, res, next) => {
  console.log("middleware 01");
  next();
});


app.use(async (req, res, next) => {
  const myPromise = () => new Promise((resolve) => {
    setTimeout(() => {
      next();
      resolve("promise resolved!");
    }, 2000);
  });

  const timeRes = await myPromise();
  console.log(timeRes);
});


app.use(async (req, res, next) => {
  console.log("middleware 03");
  res.end("hello~");
});

app.listen(8001, () => {
  console.log("listening!");
});