// 盗用构造函数
// 它的本质就是在子类的构造函数中重新调用父类的构造函数，让初始值”重置“
function SuperType() {
  this.colors = ['red', 'blue', 'green']
}

// 盗用构造函数的缺点，这种模式基本上不能单独使用，于是我们有了组合继承
SuperType.prototype.sayHello = function () {
  console.log('hello world')
}

function SubType() {
  // 继承 SuperType
  SuperType.call(this)
}

let instance1 = new SubType()
instance1.colors.push('black')
console.log(instance1.colors) // [ 'red', 'blue', 'green', 'black' ]
let instance2 = new SubType()
console.log(instance2.colors) // [ 'red', 'blue', 'green' ]

// error
instance1.sayHello()
