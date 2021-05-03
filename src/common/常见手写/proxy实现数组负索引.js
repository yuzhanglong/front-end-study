/*
 * File: proxy-negative-array.js
 * Description: 利用 Proxy 实现负索引
 * Created: 2021-3-25 16:34:05
 * Author: yuzhanglong
 * Email: yuzl1123@163.com
 */

const foo = new Proxy([1, 2, 3], {
  get: function(obj, prop) {
    if (prop in obj) {
      return obj[prop]
    }
    if (typeof prop !== 'symbol' && parseInt(prop) < 0) {
      return obj[obj.length + parseInt(prop)]
    }
    return undefined
  }
})

console.log(foo[-1])  // 3
console.log(foo[-2])  // 2
console.log(foo[-3])  // 1
console.log(foo[-4])  // undefined
