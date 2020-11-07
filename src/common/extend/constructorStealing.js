// 盗用构造函数
function SuperType() {
  this.colors = ["red", "blue", "green"];
}


function SubType() {
// 继承 SuperType
  SuperType.call(this);
}

let instance1 = new SubType();
instance1.colors.push("black");
console.log(instance1.colors); // "red,blue,green,black"
let instance2 = new SubType();
console.log(instance2.colors); // "red,blue,green"


// 盗用构造函数的缺点

SuperType.prototype.sayHello = function () {
  console.log("hello world");
}
instance1.sayHello();
