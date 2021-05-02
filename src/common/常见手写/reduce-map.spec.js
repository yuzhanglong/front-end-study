describe('用 reduce 实现 map', function() {
  test('reduce to map', () => {
    Array.prototype.myMap = function(callback, thisArg) {
      return this.reduce((previousValue, currentValue, currentIndex, arr) => {
        const result = callback.call(thisArg || this, currentValue, currentIndex, arr)
        previousValue.push(result)
        return previousValue
      }, [])
    }
    expect([1, 2, 3].myMap(res => res * 2)).toStrictEqual([2, 4, 6])
  })
})
