const classProxyFactory = (C) => {
  const baseInstance = new C()
  return new Proxy(baseInstance, {
    get(target, p, receiver) {
      return Reflect.get(target, p, receiver)
    },
    set(target, p, value, receiver) {
      if (typeof p === 'string') {
        if (p.startsWith('_')) {
          throw new Error('do not set!')
        }
      }
      return Reflect.set(target, p, value, receiver)
    }
  })
}
const setInstance = classProxyFactory(
  class Set {
    constructor() {
      this.value = 1
      this._foo = 66
    }
  }
)
// 约定：_开头的为私有属性，不得修改
console.log(setInstance.value)
setInstance.value = 666
console.log(setInstance._foo)
setInstance._foo = 666





