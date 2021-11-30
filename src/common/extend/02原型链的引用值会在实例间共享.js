function SuperType() {
  this.colors = ['red', 'blue', 'green']
}

function SubType() {}

SubType.prototype = new SuperType()

let instance1 = new SubType()
instance1.colors.push('black')

let instance2 = new SubType()
console.log(instance2.colors)

// [ 'red', 'blue', 'green', 'black' ]
// [ 'red', 'blue', 'green', 'black' ]
