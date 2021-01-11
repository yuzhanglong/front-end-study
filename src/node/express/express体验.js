const express = require("express");

const app = express();

app.listen(8000, () => {
  console.log("the server is running successfully!");
});

app.get('/', ((req, res, next) => {
  res.end("hello world");
}));
