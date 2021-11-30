const express = require('express')

const app = express()

// 路径 + 方法中间件

app.use((req, res, next) => {
  console.log('home middleware 01')
  next()
})

app.get('/home', (req, res, next) => {
  console.log('home and method middleware 01')
})

app.listen(8000, () => {
  console.log('success!')
})
