// 寄生组合式继承
function inheritPrototype(subType, superType) {
  let prototype = Object(superType.prototype); // 创建对象, 使用Object包裹的原因是在堆中新增一个对象，即解除引用的影响
  prototype.constructor = subType; // 增强对象
  subType.prototype = prototype; // 赋值对象
}

function SuperType(name) {
  this.name = name;
  this.colors = ["red", "blue", "green"];
}

SuperType.prototype.sayName = function () {
  console.log(this.name);
};

function SubType(name, age) {
  SuperType.call(this, name);
  this.age = age;
}

inheritPrototype(SubType, SuperType);

SubType.prototype.sayAge = function () {
  console.log(this.age);
};

let i = new SuperType("Jim");

i.sayName();
