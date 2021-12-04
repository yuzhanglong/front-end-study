console.log(Array.from('hello world'));

// 浅拷贝
let a1 = [
  {
    name: 'yzl',
    age: 20,
  },
  'hello',
];

let a2 = Array.from(a1);

console.log(a1 === a2);
console.log(a1[0] === a2[0]);

// 转换可迭代对象
const iter = {
  *[Symbol.iterator]() {
    yield 1;
    yield 2;
    yield 3;
  },
};

console.log(Array.from(iter)); // [ 1, 2, 3 ]

// 数组空位
// 由于行为不一致和存在性能隐患，因此实践中要避免使用数组空位。如果确实需要
// 空位，则可以显式地用 undefined 值代替。
const arr = [1, 2, , , , 6];
console.log(arr);
console.log(arr.map((res) => res));
