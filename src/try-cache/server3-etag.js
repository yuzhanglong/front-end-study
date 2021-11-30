const Koa = require('koa')
const fs = require('fs')
const app = new Koa()
const path = require('path')

// 图片对应的hash值，用来表示图片的唯一性，这里用字符串代替
// 这个hash值会存储在服务端，一旦这个hash值被修改
// （例如文件更新了，hash值可以根据文件内容进行计算），那么就无法命中缓存
const HASH = 'test-hash'

app.use(async (ctx) => {
  ctx.set('Content-Type', 'image/gif')
  ctx.set('Etag', HASH)
  let request = ctx.request
  if (request.headers['if-none-match'] === HASH) {
    ctx.status = 304
  } else {
    ctx.body = await fs.readFileSync(path.resolve(__dirname, 'test.gif'))
  }
})

app.listen(3000)
