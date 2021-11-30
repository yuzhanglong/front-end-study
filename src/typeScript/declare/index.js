'use strict'
exports.__esModule = true
var script_1 = require('./src/script')
console.log(script_1.foo)
script_1.greet({
  greeting: 'hahah',
  duration: 4000,
})
script_1.myLib.makeGreeting('hello')
console.log(script_1.myLib.numberOfGreetings)
var gt = new script_1.Greeter('hello world')
gt.showGreeting()
console.log(gt.greeting)
