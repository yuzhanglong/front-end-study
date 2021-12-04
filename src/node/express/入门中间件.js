const express = require('express');

const app = express();

// 注册中间件

app.use((req, res) => {
  console.log('注册成功~');
});

app.listen(8000, () => {
  console.log('success!');
});
