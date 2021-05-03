describe('call', function() {
  test('实现 call', () => {
    Function.prototype.myCall = function(targetThis, ...args) {
      const fn = this
      if (!targetThis) {
        return fn(...args)
      }

      const fnKey = Symbol.for('function key')
      targetThis[fnKey] = fn
      const returnVal = targetThis[fnKey](...args)
      Reflect.deleteProperty(targetThis, fnKey)
      return returnVal
    }

    function hello() {
      expect(this.a).toStrictEqual(1)
      expect(this.b).toStrictEqual(2)
    }

    hello.myCall({
      a: 1,
      b: 2
    })
  })
})
