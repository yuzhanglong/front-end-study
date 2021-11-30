function addArguments(arg1, arg2) {
  return arg1 + arg2
}

let result1 = addArguments(1, 2) // 3

console.log(result1)
// 创建一个函数，它拥有预设的第一个参数
let addThirtySeven = addArguments.bind(null, 37)

let result2 = addThirtySeven(5)
// 37 + 5 = 42
console.log(result2)

let result3 = addThirtySeven(5, 10)
// 37 + 5 = 42 ，第二个参数被忽略
console.log(result3)
