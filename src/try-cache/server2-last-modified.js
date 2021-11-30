const Koa = require('koa')
const fs = require('fs')
const app = new Koa()
const path = require('path')

const shouldServerResponseData = (header) => {
  // 缓存失效的业务逻辑
  let oldTime = new Date(header).getTime()
  return oldTime + 3 * 1000 > Date.now()
}

app.use(async (ctx) => {
  ctx.set('Content-Type', 'image/gif')
  ctx.set('last-modified', new Date().toUTCString())
  let request = ctx.request
  if (shouldServerResponseData(request.headers['if-modified-since'])) {
    ctx.status = 304
  } else {
    ctx.body = await fs.readFileSync(path.resolve(__dirname, 'test.gif'))
  }
})

app.listen(3000)
