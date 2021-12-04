const Koa = require('koa');

const app = new Koa();

app.use((ctx, next) => {
  console.log('middleware 01 in app.use');
  next();
  console.log('middleware 01 in app.use after next');
});

app.use((ctx, next) => {
  console.log('middleware 02 in app.use');
  next();
  console.log('middleware 02 in app.use after next');
});

app.use((ctx, next) => {
  console.log('middleware 03 in app.use');
  ctx.response.body = 'hi~';
});

app.listen(8000, () => {
  console.log('success!');
});
