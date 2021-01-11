const Koa = require("koa");
const Router = require("koa-router");


const homeRouter = new Router({
  prefix: "/home"
});

homeRouter.post("/", (ctx, next) => {
  ctx.response.body = "post home!";
});

homeRouter.get("/", (ctx, next) => {
  ctx.response.body = "get home!";
})

const app = new Koa();


app.use(homeRouter.routes());
app.use(homeRouter.allowedMethods());


app.listen(8000, () => {
  console.log("success!");
});