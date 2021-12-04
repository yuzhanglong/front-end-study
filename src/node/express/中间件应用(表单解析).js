const express = require('express');
const multer = require('multer');

const app = express();

const upload = multer();

app.use(upload.any());

app.post('/login', (req, res, next) => {
  console.log(req.body);
  res.end('hello');
});

app.listen(8000, () => {
  console.log('success~');
});
