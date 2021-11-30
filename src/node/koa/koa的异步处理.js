const Koa = require('koa')

const app = new Koa()

const myPromise = () =>
  new Promise((resolve) => {
    setTimeout(() => {
      resolve('promise resolved!')
    }, 2000)
  })

const m1 = async (ctx, next) => {
  console.log('middleware 01')
  await next()
  console.log('after middleware 01 next')
  ctx.response.body = 'hello world!'
}

const m2 = async (ctx, next) => {
  const timeRes = await myPromise()
  console.log(timeRes)
}
app.use(m1)

app.use(m2)

app.listen(8000, () => {
  console.log('listening!')
})
