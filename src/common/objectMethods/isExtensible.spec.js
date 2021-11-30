describe('Object.isExtensible', () => {
  test('方法判断一个对象是否是可扩展的（是否可以在它上面添加新的属性）。', () => {
    expect(Object.isExtensible({})).toBeTruthy()
    expect(Object.isExtensible(66)).toBeFalsy()
    expect(Object.isExtensible(Object.preventExtensions({}))).toBeFalsy()
    expect(Object.isExtensible(Object.seal({}))).toBeFalsy()
    expect(Object.isExtensible(Object.freeze({}))).toBeFalsy()
  })
})
