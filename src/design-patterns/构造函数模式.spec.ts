describe('构造器模式', function () {
  // 在经典的面向对象编程语言中
  // 构造函数是一种特殊的方法
  // 用于在为新创建的对象分配内存后初始化它
  // 在JavaScript中，几乎所有东西都是对象
  test('用三种方式创建一个新的对象', () => {
    const newObject1 = {}

    const newObject2 = Object.create(Object.prototype)

    const newObject3 = new Object()

    expect(typeof newObject1).toStrictEqual('object')
    expect(typeof newObject2).toStrictEqual('object')
    expect(typeof newObject3).toStrictEqual('object')
  })

  test('尝试为对象添加属性', () => {
    const newObject: { [key: string]: any } = {}
    // 点号赋值
    newObject.someKey = 'hello world!'
    expect(newObject.someKey).toStrictEqual('hello world!')

    // 中括号复制
    newObject['someKey'] = 'hello yzl!'
    expect(newObject['someKey']).toStrictEqual('hello yzl!')

    // defineProperty
    Object.defineProperty(newObject, 'someKey', {
      value: 'yuzhanglong',
    })
    expect(newObject.someKey).toStrictEqual('yuzhanglong')
  })

  test('构造函数 && 原型', () => {
    function Car(model, year, miles) {
      this.model = model
      this.year = year
      this.miles = miles
    }

    // Note here that we are using Object.prototype.newMethod rather than
    // Object.prototype so as to avoid redefining the prototype object
    Car.prototype.toString = function () {
      return this.model + ' has done ' + this.miles + ' miles'
    }

    // Usage:
    const foo = new Car('foo', 2009, 20000)
    const bar = new Car('bar', 2010, 5000)

    console.log(foo.toString())
    console.log(bar.toString())
  })
})
