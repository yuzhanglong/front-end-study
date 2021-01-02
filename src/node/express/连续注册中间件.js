const express = require("express");

const app = express();

app.use((req, res, next) => {
  console.log("middleware 01 in app.use");
  next();
}, (req, res, next) => {
  console.log("middleware 02 in app.use");
  next();
});

app.get('/home', (req, res, next) => {
  console.log("home and get method middleware 01");
  next();
}, (req, res, next) => {
  console.log("home and get method middleware 02");
  next();
}, (req, res, next) => {
  console.log("home and get method middleware 03");
  res.end("hello world");
});


app.listen(8000, () => {
  console.log("your project is running successfully!");
});

