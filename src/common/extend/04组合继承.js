// 组合继承, 其原理是在子类的构造函数中调用父类构造函数，让实例都有自己的属性
// 同时也进行了原型的赋值，继承了方法

function SuperType(name) {
  this.colors = ['red', 'blue', 'green'];
  this.name = name;
}

SuperType.prototype.sayName = function () {
  console.log(this.name);
};

function SubType(name, age) {
  // 继承父类的属性
  SuperType.call(this, name);
  this.age = age;
}

// 继承父类的方法
SubType.prototype = new SuperType();

SubType.prototype.sayAge = function () {
  console.log(this.age);
};

let instance1 = new SubType('Nicholas', 29);
instance1.colors.push('black');

console.log(instance1.colors); // [ 'red', 'blue', 'green', 'black' ]
instance1.sayName(); // "Nicholas";
instance1.sayAge(); // 29

let instance2 = new SubType('Greg', 27);

console.log(instance2.colors); // [ 'red', 'blue', 'green' ]
instance2.sayName(); // "Greg";
instance2.sayAge(); // 27
