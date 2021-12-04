let message = require('./index.js').message;
const bar = require('./bar');

console.log('counter.js', bar);

exports.count = 5;

setTimeout(() => {
  console.log(message);
}, 0);
