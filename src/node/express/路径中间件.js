const express = require('express');

const app = express();

// 路径中间件
app.use('/home', (req, res, next) => {
  console.log('home middleWare 1 注册成功~');
  next();
});

app.use('/home', (req, res) => {
  console.log('home middleWare 2 注册成功~');
  res.end('home~');
});

app.listen(8000, () => {
  console.log('success!');
});
