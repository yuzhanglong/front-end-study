const express = require("express");

const app = new express();


const promiseWrapper = (fn) => {
  return (req, res, next) => {
    try {
      return fn(req, res, () => {
        return Promise.resolve(next());
      });
    } catch (e) {
      return Promise.reject(e);
    }
  }
}


app.use(promiseWrapper(async (req, res, next) => {
  console.log("middleware 01");
  await next();
  res.end("hello~");
}));


app.use(promiseWrapper(async (req, res, next) => {
  let result = await new Promise((resolve) => {
    setTimeout(() => {
      resolve("promise resolved!");
    }, 2000);
  });
  console.log(result);
}));


app.listen(8000, () => {
  console.log("listening!");
})