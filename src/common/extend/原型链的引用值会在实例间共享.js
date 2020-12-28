function SuperType() {
  this.colors = ["red", "blue", "green"];
}

function SubType() {

}

SubType.prototype = new SuperType();

let instance1 = new SuperType();
instance1.colors.push("black");
console.log(instance1.colors);

let instance2 = new SuperType();
console.log(instance2.colors);

// [ 'red', 'blue', 'green', 'black' ]
// [ 'red', 'blue', 'green' ]
