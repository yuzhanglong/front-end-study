describe('Object.seal', function () {
  test('Object.seal()方法封闭一个对象，阻止添加新属性并将所有现有属性标记为不可配置。当前属性的值只要原来是可写的就可以改变', () => {
    const obj = {
      aa: 1,
      bb: 2,
    }
    Object.seal(obj)
    obj.aa = 312
    expect(obj.aa).toStrictEqual(312)
    obj.cc = 555
    expect(obj.cc).toStrictEqual(undefined)

    try {
      Object.defineProperty(obj, 'aa', {
        get: function () {
          return 'g'
        },
      })
    } catch (e) {
      expect(e.message).toStrictEqual('Cannot redefine property: aa')
    }
  })
})
