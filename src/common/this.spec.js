describe('this', function() {
  test('problem 1', () => {
    function fn() {
      console.log(this)
      return this.length + 1
    }

    const obj = {
      length: 5,
      test1: function() {
        return fn()
      }
    }
    obj.test2 = fn

    console.log(obj.test1())
    console.log(fn() === obj.test2())
  })
})