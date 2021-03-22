const Koa = require('koa')
const cors = require('koa2-cors')

// 创建 Koa App
const app = new Koa()

// 处理跨域
// app.use(cors())

app.use((ctx) => {
  ctx.set('content-type', 'text/html')
  ctx.body = `<div>123123123</div>`
})

// 监听端口
app.listen(8000, () => {
  console.log('your project is running successfully!')
})

