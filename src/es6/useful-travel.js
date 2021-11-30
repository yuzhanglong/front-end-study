describe('Object 常见遍历', () => {
  test('for in 遍历对象及其原型链上可枚举的属性', () => {
    Array.prototype.sayHello = () => {
      console.log('hello')
    }
    const arr = [1, 2, 3]
    arr.name = 'yzl'

    const foo = []
    for (let a in arr) {
      foo.push(a)
    }

    expect(foo).toStrictEqual(['0', '1', '2', 'name', 'sayHello'])
  })

  test('Object keys', () => {
    function Person() {
      this.name = 'yzl'
      this.symbol = Symbol.for('for')
      this[Symbol.for('bar')] = 123
    }

    Person.prototype.getName = function () {
      return this.name
    }

    const person = new Person()
    expect(Object.keys(person)).toStrictEqual(['name', 'symbol'])
  })

  test('使用 Object.keys()', () => {
    const person = {
      name: 'yzl',
      age: 20,
    }
    const res = []
    for (const key of Object.keys(person)) {
      res.push(person[key])
    }
    expect(res).toStrictEqual(['yzl', 20])
  })

  test('使用 Object.entries()', () => {
    const object1 = {
      a: 'somestring',
      b: 42,
    }
    const res = []
    for (const [key, value] of Object.entries(object1)) {
      res.push(`${key}: ${value}`)
    }
    expect(res).toStrictEqual(['a: somestring', 'b: 42'])
  })

  test('将 Object 转换为 Map', () => {
    const obj = { foo: 'bar', baz: 666 }
    const map = new Map(Object.entries(obj))
    expect(map.get('foo')).toStrictEqual('bar')
    expect(map.get('baz')).toStrictEqual(666)
  })
})
