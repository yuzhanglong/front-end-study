/*
 * File: assignAndSpread.js
 * Description: 扩展运算符和 assign
 * Created: 2021-3-10 09:47:33
 * Author: yuzhanglong
 * Email: yuzl1123@163.com
 */

// 扩展运算符的一般使用方法 {...obj} 创建一个和 obj 具有相同属性的对象。
const obj = { foo: 'bar' }
const clone = { ...obj } // `{ foo: 'bar' }`
obj.foo = 'baz'
console.log(clone.foo)
console.log(obj === clone)


class BaseClass {
  foo() {
    return 1
  }
}

class MyClass extends BaseClass {
  bar() {
    return 2
  }
}

const obj2 = new MyClass()
obj2.baz = function() {
  return 3
}

obj2[Symbol.for('test')] = 4

// Does _not_ copy any properties from `MyClass` or `BaseClass`
const clone2 = { ...obj2 }

// 与 object.assign()类似，
// Object spread 操作符不复制继承的属性或类的属性。
// 但是它会复制 ES6 的 symbols 属性。

console.log(clone2) // { baz: [Function], [Symbol(test)]: 4 }
console.log(clone2.constructor.name) // Object
console.log(clone2 instanceof MyClass) // false


// object assign 会触发 setter
class MyClass2 {
  set val(v) {
    console.log('Setter called', v)
  }
}

const obj3 = new MyClass2()

console.log(Object.assign(obj3, { val: 42 }))

const f = {
  obj3,
  val: 42
}
console.log(f)

// 可以看出， 触发 setter 只会触发第一个
console.log(Object.assign({ val: 42 }, obj3))


// 一些边界问题
// 下面的代码是错误的语法
// console.log({null, ...f})

console.log({ undefined, ...f })  // { undefined: undefined, obj3: MyClass2 {}, val: 42 }

// console.log(Object.assign(undefined, f))  // Cannot convert undefined or null to object

// console.log(Object.assign(null, f))  // Cannot convert undefined or null to object