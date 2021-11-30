const Koa = require('koa')
const koaBody = require('koa-body')
const path = require('path')
const fs = require('fs')

const app = new Koa()

app.use(
  koaBody({
    formidable: {
      //设置文件的默认保存目录，不设置则保存在系统临时目录下  os
      uploadDir: path.resolve(__dirname, '../static/uploads'),
    },
    multipart: true, // 开启文件上传，默认是关闭
  })
)

app.use((ctx) => {
  ctx.set('Access-Control-Allow-Origin', '*')
  const file = ctx.request.files['f1']
  const { filename, token, type, begin, end } = ctx.request.body
  if (type !== 'MERGE') {
    const extArr = filename.split('.')
    fs.renameSync(
      file.path,
      path.resolve(
        path.dirname(file.path),
        `${extArr[0]}-${token}.${extArr[extArr.length - 1]}`
      )
    )
  } else {
    let b = parseInt(begin)
    let e = parseInt(end)
    console.log(b, '===', e)
    const extArr = filename.split('.')
    const writeStream = fs.createWriteStream(
      `${path.resolve(__dirname, '../static/uploads', filename)}`
    )

    const mergeFiles = () => {
      const name = path.resolve(
        __dirname,
        '../static/uploads',
        `${extArr[0]}-${b}.${extArr[extArr.length - 1]}`
      )
      const readStream = fs.createReadStream(name)
      readStream.pipe(writeStream, { end: false })
      readStream.on('end', () => {
        fs.unlink(name, (err) => {
          if (err) {
            // 如果可读流在处理期间发送错误，则可写流目标不会自动关闭。 如果发生错误，则需要手动关闭每个流以防止内存泄漏。
            writeStream.end()
            throw err
          }
          if (b < e) {
            b += 1
            console.log(b)
            // eslint-disable-next-line no-unused-vars
            mergeFiles()
          }
        })
      })
    }
    mergeFiles()
  }

  ctx.body = {
    status: '00000',
  }
})

app.listen(8080, () => {
  console.log('listening 8080!')
})
