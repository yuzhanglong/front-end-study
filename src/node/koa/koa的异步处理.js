const Koa = require("koa");

const app = new Koa();

const myPromise = () => new Promise((resolve) => {
  setTimeout(() => {
    resolve("promise resolved!");
  }, 2000);
});


app.use(async (ctx, next) => {
  console.log("middleware 01");
  await next();
  console.log("after middleware 01 next");
  ctx.body = "hello~";
});


app.use((ctx, next) => {
  // const timeRes = await myPromise();
  setTimeout(() => {
    console.log("timeout!");
  }, 1000);
  // console.log(timeRes);
});


app.listen(8000, () => {
  console.log("listening!");
})