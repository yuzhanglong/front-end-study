describe('bind', () => {
  test('实现 bind', () => {
    Function.prototype.myBind = function(thisArg, ...args) {
      const fn = this

      if (typeof fn !== 'function') {
        throw new Error('只能使用函数来调用bind')
      }

      const bindFn = function(...fnArgs) {
        const isUseNew = this instanceof bindFn

        return fn.call(isUseNew ? this : thisArg, ...args, ...fnArgs)
      }

      Object.defineProperties(bindFn, {
        name: {
          value: `bound ${fn.name}`
        }
      })

      bindFn.prototype = Object.create(fn.prototype)
      return bindFn
    }


    function foo() {
      expect(this.a).toStrictEqual(1)
      expect(this.b).toStrictEqual(2)
    }

    const fn2 = foo.myBind({
      a: 1,
      b: 2
    })
    const fn3 = foo.bind({
      a: 1,
      b: 2
    })

    fn2()
    fn3()


    const fn4 = function(a, b) {
      console.log('this', this)
      this.a = a
      this.b = b
    }
    const fn4Bind = fn4.myBind({
      name: 'yzl', age: 20
    })

    let obj = new fn4Bind(2, 3)
    expect(obj.a).toStrictEqual(2)
    expect(obj.b).toStrictEqual(3)
  })
})
