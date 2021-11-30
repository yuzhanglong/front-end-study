// concat
let foo = [1, 2, 3]

console.log(foo.concat(1, 2, 4, [1, 5]))

// 默认打平，可以强制不打平
let more = {
  [Symbol.isConcatSpreadable]: false,
  length: 2,
  0: 4,
  1: 5,
}

let res = foo.concat(more)

// slice
let colors = ['red', 'green', 'blue', 'yellow', 'purple']
console.log(colors.slice(1, 4))

// splice
colors.splice(1, 0, 'orange', 'purple')
console.log(colors)

colors.splice(2, 1) // ['red', 'orange', 'purple', 'green', 'blue', 'yellow', 'purple']
console.log(colors) // [ 'red', 'orange', 'green', 'blue', 'yellow', 'purple' ]
colors.splice(1, 2, 'pink')
console.log(colors)
