describe('Object.entries', function() {
  test('Object.entries() 方法返回一个给定对象自身可枚举属性的键值对数组', () => {
    const object1 = {
      a: 'someString',
      b: 42
    }
    const res = []
    for (const [key, value] of Object.entries(object1)) {
      res.push(`${key}: ${value}`)
    }
    expect(res).toStrictEqual([
      'a: someString',
      'b: 42'
    ])
  })
})