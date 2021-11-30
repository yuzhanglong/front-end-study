// main.js
const foo = require('./foo.js')

console.log(foo.name)

setTimeout(() => {
  console.log(foo.name)
}, 1000)
