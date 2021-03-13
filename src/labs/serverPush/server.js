const http2 = require('http2')
const fs = require('fs')
const Koa = require('koa')
const Router = require('koa-router')
const path = require('path')

const options = {
  key: fs.readFileSync('./server.key', 'utf8'),
  cert: fs.readFileSync('./server.cert', 'utf8')
}

class KoaHttp2 extends Koa {
  listen() {
    const server = http2.createSecureServer(options, this.callback())
    return server.listen.apply(server, arguments)
  }
}

const app = new KoaHttp2()

const router = new Router()

router.get('/', (ctx) => {
  ctx.set('Link', '</style>; rel=preload; as=style')
  ctx.body = fs.readFileSync(path.resolve(__dirname, './index.html')).toString()
})


router.get('/style', (ctx) => {
  ctx.set('content-type', 'text/css')
  ctx.body = fs.readFileSync(path.resolve(__dirname, './style.css')).toString()
})

app.use(router.routes())

app.listen(8080, () => {
  console.log('https://localhost:8080')
})