describe('new', function() {
  test('实现 new', () => {
    function myNew(fn, ...args) {
      if (typeof fn !== 'function') {
        throw new Error('error!')
      }

      const newObj = Object.create(fn.prototype)
      const fnReturn = fn.apply(newObj, args)
      const isObjectReturn = typeof fnReturn === 'object' && fnReturn !== null
      const isFn = typeof fnReturn === 'function'
      if (isObjectReturn || isFn) {
        return fnReturn
      }
      return newObj
    }

    function Car(make, model, year) {
      this.make = make
      this.model = model
      this.year = year
    }

    const carInstance = myNew(Car, 'Eagle', 'Talon TSi', 1993)
    expect(carInstance.make).toStrictEqual('Eagle')
    expect(carInstance.model).toStrictEqual('Talon TSi')
    expect(carInstance.year).toStrictEqual(1993)

    function Thing() {
      this.one = 1
      this.two = 2
      return 5
    }

    const myThing = myNew(Thing)

    expect(myThing.one).toStrictEqual(1)
    expect(myThing.two).toStrictEqual(2)


    function Foo() {
      this.one = 1
      this.two = 2
      return {
        one: 111,
        two: 222
      }
    }

    const myFoo = myNew(Foo)

    expect(myFoo.one).toStrictEqual(111)
    expect(myFoo.two).toStrictEqual(222)
  })
})
