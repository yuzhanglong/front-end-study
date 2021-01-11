// every()： 对数组每一项都运行传入的函数，如果对每一项函数都返回 true， 则这个方法返回 true。
const data = [1, 2, 5, 6];
const data2 = [2, 4, 6];
console.log(data.every((v) => v % 2 === 0));
console.log(data2.every((v) => v % 2 === 0));


// filter()：对数组每一项都运行传入的函数，函数返回 true 的项会组成数组之后返回
console.log(data.filter((item, index) => item % 2 === 0));
// [ 2, 6 ]

// map()：对数组每一项都运行传入的函数，返回由每次函数调用的结果构成的数组。
console.log(data2.map((item) => item * 2));
// [ 4, 8, 12 ]

// some()：对数组每一项都运行传入的函数，如果有一项函数返回 true，则这个方法返回 true。
console.log(data.some((v) => v % 2 === 0));
