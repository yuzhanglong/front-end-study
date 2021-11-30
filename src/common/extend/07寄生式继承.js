function createAnother(original) {
  let clone = Object.create(original)
  clone.sayHi = function () {
    console.log(this.name + ' say hi')
  }
  return clone
}

let person = {
  name: 'yzl',
  friends: ['aa', 'bb', 'cc'],
}

let p2 = createAnother(person)
p2.sayHi()
