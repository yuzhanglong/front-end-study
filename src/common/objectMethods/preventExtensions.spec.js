describe('Object.preventExtensions()', function() {
  test('让一个对象变的不可扩展，也就是永远不能再添加新的属性', () => {
    const object1 = {}

    Object.preventExtensions(object1)

    try {
      Object.defineProperty(object1, 'property1', {
        value: 42
      })
    } catch (e) {
      expect(e.message).toStrictEqual('Cannot define property property1, object is not extensible')
    }
  })

  test('Object.preventExtensions()仅阻止添加自身的属性。但其对象类型的原型依然可以添加新的属性。', () => {
    function Foo() {
    }

    Foo.prototype.bar = 666
    Object.preventExtensions(Foo)
    try {
      Object.defineProperty(Foo, 'property1', {
        value: 42
      })
    } catch (e) {
      console.log(e)
      expect(e.message).toStrictEqual('Cannot define property property1, object is not extensible')
    }

    Object.defineProperty(Foo.prototype, 'property2', {
      value: 42
    })
    expect(Foo.prototype.property2).toStrictEqual(42)
    try {
      Foo.__proto__ = {}
    } catch (e) {
      console.log(e)
    }
  })
})