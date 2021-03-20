describe('Object.fromEntries', function() {
  test('Object.fromEntries() 方法把键值对列表转换为一个对象。', () => {
    const entries = new Map([
      ['foo', 'bar'],
      ['baz', 42]
    ])

    const obj = Object.fromEntries(entries)

    expect(obj).toStrictEqual({
      'baz': 42,
      'foo': 'bar'
    })
  })
})