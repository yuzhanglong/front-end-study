const foo = require('./foo')

console.log(foo.name)
console.log(foo.age)
foo.sayHello()

setTimeout(() => {
  console.log(foo.name)
}, 0)
