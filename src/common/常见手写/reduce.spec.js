describe('reduce', function () {
  test('实现 reduce', () => {
    Array.prototype.myReduce = function (callback, initialValue) {
      let result = initialValue ? initialValue : this[0]
      let start = initialValue ? 0 : 1
      const len = this.length
      for (let i = start; i < len; i++) {
        result = callback(result, this[i], i, this)
      }
      return result
    }

    expect(
      [1, 2, 4, 6].myReduce((prev, current) => prev + current, 10)
    ).toStrictEqual(23)
    expect(
      [1, 2, 4, 6].myReduce((prev, current) => prev + current)
    ).toStrictEqual(13)
  })
})
