function inherit(subType, superType) {
  let prototype = Object.create(superType.prototype)
  prototype.constructor = subType
  subType.prototype = prototype
}

function SuperType(name) {
  this.name = name
  this.colors = ['red', 'blue', 'green']
}

SuperType.prototype.sayName = function () {
  console.log(this.name)
}

function SubType(name, age) {
  SuperType.call(this, name)
  this.age = age
}

inherit(SubType, SuperType)

SubType.prototype.sayAge = function () {
  console.log(this.age)
}

let sub = new SubType('yzl', 20)
sub.sayAge()
sub.sayName()

// 和组合式继承优越在哪里？
// 它少调用了一次构造函数，详细地说：
// 我们要实现继承，必须两个目标，
// 第一：父类的构造函数要被重写，即让实例都拥有自己的属性
// 第二，SubType.prototype 必须继承父类的方法
// 使用 SubType.prototype = new SuperType() 虽然实现了第二个目标，
// 但是会造成重复执行父类的构造函数，失去了意义

// 寄生式组合继承可以算是引用类型继承的最佳模式
