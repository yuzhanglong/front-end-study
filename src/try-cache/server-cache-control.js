const Koa = require('koa')
const fs = require('fs')
const app = new Koa()
const path = require('path')

app.use(async (ctx) => {
  ctx.body = await fs.readFileSync(path.resolve(__dirname, 'test.gif'))
  ctx.set('Content-Type', 'image/gif')
  ctx.set('expires', new Date(Date.now() + 1000 * 10).toISOString())
  ctx.set('Cache-Control', 'max-age=3')
})

app.listen(3000)
