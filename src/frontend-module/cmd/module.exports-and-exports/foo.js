const name = 'yzl'
const age = 20
const sayHello = () => {
  console.log('hello world!')
}

exports.name = name
exports.age = age
exports.sayHello = sayHello

module.exports = {
  name: 'yzl2',
  age: 21
}
