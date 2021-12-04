const express = require('express');

const app = express();

app.use(
  (req, res, next) => {
    console.log('middleware 01 in app.use');
    next();
    console.log('after m1 next');
  },
  (req, res, next) => {
    console.log('middleware 02 in app.use');
    next();
    console.log('after m2 next');
  }
);

app.get(
  '/home',
  (req, res, next) => {
    console.log('home and get method middleware 01');
    next();
    console.log('after m3 next');
  },
  (req, res, next) => {
    console.log('home and get method middleware 02');
    next();
    console.log('after m4 next');
  },
  (req, res, next) => {
    console.log('home and get method middleware 03');
    res.end('hello world');
  }
);

app.post(
  '/home',
  (req, res, next) => {
    console.log('home and get method middleware 01');
    next();
    console.log('after m3 next');
  },
  (req, res, next) => {
    console.log('home and get method middleware 02');
    next();
    console.log('after m4 next');
  },
  (req, res, next) => {
    console.log('home and get method middleware 03');
    res.end('hello world');
  }
);

app.post(
  '/family',
  (req, res, next) => {
    console.log('family and get method middleware 01');
    next();
    console.log('after family m3 next');
  },
  (req, res, next) => {
    console.log('family and get method middleware 02');
    next();
    console.log('after family m4 next');
  },
  (req, res, next) => {
    console.log('family and get method middleware 03');
    res.end('hello family');
  }
);
app.get(
  '/home/family',
  (req, res, next) => {
    console.log('home and get method middleware 01');
    next();
    console.log('after m3 next');
  },
  (req, res, next) => {
    console.log('home and get method middleware 02');
    next();
    console.log('after m4 next');
  },
  (req, res, next) => {
    console.log('home and get method middleware 03');
    res.end('hello world');
  }
);

app.listen(8000, () => {
  console.log('your project is running successfully!');
});
