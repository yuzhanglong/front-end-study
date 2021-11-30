let numbers = [1, 2, 3, 5, 6]
console.log(numbers.indexOf(1))
console.log(numbers.indexOf(9))
// 注意：indexOf 的比较是严格相等的

// find & findIndex  找到匹配项后，这两个方法都不再继续搜索
const people = [
  {
    name: 'Matt',
    age: 27,
  },
  {
    name: 'Nicholas',
    age: 29,
  },
]

console.log(
  people.find((e, i, r) => {
    return e.age < 28
  })
)
console.log(
  people.findIndex((e, i, r) => {
    return e.age < 28
  })
)
