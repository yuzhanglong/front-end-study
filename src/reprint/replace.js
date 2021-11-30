const fs = require('fs')
const path = require('path')

const baseUrl = path.resolve(process.cwd(), '前端面试小册')

const files = fs.readdirSync(baseUrl)

files.forEach((p) => {
  const filePath = path.resolve(baseUrl, p)
  const content = fs.readFileSync(filePath).toString()
  const replace = content.replace(
    /!\[]\(https:\/\/user-gold-cdn.xitu.io\/(.*)\)/g,
    (value) => {
      const res = value.split(/!\[]\((.*)\)/g)[1].split(' ')[0]
      const tmp = res.replace(
        'https://user-gold-cdn.xitu.io/',
        'https://p1-jj.byteimg.com/tos-cn-i-t2oaga2asx/gold-user-assets/'
      )
      const tmp2 = tmp.split('?')
      return `![](${tmp2[0]}~tplv-t2oaga2asx-watermark.awebp)`
    }
  )
  fs.writeFileSync(filePath, replace)
})
