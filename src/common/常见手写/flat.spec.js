describe('数组扁平化', function () {
  test('flatten array', () => {
    Array.prototype.myFlat = function (depth = 1) {
      return depth > 0
        ? this.reduce((previousValue, currentValue) => {
            return previousValue.concat(
              Array.isArray(currentValue)
                ? currentValue.myFlat(depth - 1)
                : currentValue
            )
          }, [])
        : this
    }

    expect([1, 2, 4, [1, 4]].myFlat(1)).toStrictEqual([1, 2, 4, 1, 4])
    expect([1, 2, 4, [1, [4]]].myFlat(1)).toStrictEqual([1, 2, 4, 1, [4]])
  })
})
