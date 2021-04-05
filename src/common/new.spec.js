describe('实现 new', function() {
  test('basic', () => {
    function myNew(fn) {
      if (typeof fn !== 'function') {
        throw new Error('fn!')
      }
      // newObj.___proto__ = fn.prototype
      const newObj = Object.create(fn.prototype)
      const applyReturn = fn.apply(newObj, [].slice.call(arguments, 1))
      const isObj = typeof applyReturn !== 'object' && applyReturn !== null
      const isFn = typeof applyReturn === 'function'
      if (isFn || isObj) {
        return applyReturn
      }
      return newObj
    }

    expect(myNew(Array).__proto__).toBe(Array.prototype)
    expect(myNew(Array).prototype).toBe(undefined)
    expect(typeof myNew(Array).reduce).toStrictEqual('function')
  })
})
