describe('实现 instanceOf', function () {
  test('instanceof 运算符用于检测构造函数的 prototype 属性是否出现在某个实例对象的原型链上', () => {
    function instanceOf(instance, target) {
      if (!instance) {
        return false
      }
      const __proto__ = Object.getPrototypeOf(instance)
      return __proto__ === target.prototype
        ? true
        : instanceOf(__proto__, target)
    }

    expect(instanceOf({}, Object)).toBeTruthy()
    expect(instanceOf([], Object)).toBeTruthy()
    expect(instanceOf([], Array)).toBeTruthy()
    expect(instanceOf([], Number)).toBeFalsy()
    expect(instanceOf(Array, Function)).toBeTruthy()
    expect(instanceOf(Function, Object)).toBeTruthy()
    // 很明显，基本类型是不适用的
    // expect(instanceOf('233', String)).toStrictEqual('233' instanceof String)
  })
})
