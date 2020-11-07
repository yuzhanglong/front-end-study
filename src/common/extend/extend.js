function SuperType() {
  this.colors = ["red", "blue", "green"];
}

SuperType.prototype.showColor = function () {
  console.log(this.colors);
}


function SubType() {
// 继承 SuperType
  SuperType.call(this);
}

SubType.prototype.sayColor = function () {
  console.log(this.colors);
}

let instance1 = new SubType();
instance1.showColor();



