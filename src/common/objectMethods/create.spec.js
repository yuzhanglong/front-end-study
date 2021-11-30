describe('Object.create()', () => {
  test('Object.create() 方法创建一个新对象，使用现有的对象来提供新创建的对象的__proto__', () => {
    const person = {
      isHuman: false,
    }
    const me = Object.create(person)
    expect(me.__proto__).toBe(person)
  })

  test('Object.create 的第二个参数', () => {
    const person = {
      isHuman: false,
    }
    const me = Object.create(person, {
      property1: {
        value: true,
        writable: true,
      },
      property2: {
        value: 'Hello',
        writable: false,
      },
    })
    expect(me.__proto__).toBe(person)
    expect(me.property1).toStrictEqual(true)
    expect(me.property2).toStrictEqual('Hello')
  })
})
