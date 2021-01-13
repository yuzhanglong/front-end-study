const koa = require("koa");
const Router = require("koa-router");
const Session = require("koa-session");


const app = new koa();


const testRouter = new Router();


const session = Session({
  key: "sessionId",
  maxAge: 100 * 1000,
  signed: true
}, app);

app.keys = ["yzlyzl"];

app.use(session);

testRouter.get("/login", (ctx, next) => {
  const id = 100;
  const name = "yzl";

  ctx.session.user = {id, name};

  ctx.body = "test";
});

testRouter.get("/get_session", (ctx, next) => {
  // 这里可以拿到 session
  console.log(ctx.session.user);

  ctx.body = ctx.session.user;
});
// testRouter.get("/test", (ctx, next) => {
//   ctx.body = "test~";
//
//   ctx.cookies.set("name", "yzl", {
//     maxAge: 1000 * 100
//   })
// });
//
//
// testRouter.get("/hello", (ctx, next) => {
//   ctx.body = "hello~";
//   ctx.body = `The cookie: ${ctx.cookies.get("name")}`;
// });

app.use(testRouter.routes());


app.listen(8000, () => {
  console.log("server running successfully!");
});