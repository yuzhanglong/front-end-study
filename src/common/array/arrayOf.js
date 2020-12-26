const a = Array.of(1, 2, 3, 4);
console.log(a);

let foo = function () {
  // 利用 arrayof 将 arguments 对象转换为数组
  console.log(Array.of(...arguments));
  // 当然你也可以用略显麻烦的方法：
  console.log(Array.prototype.slice.call(arguments));
}

foo(1, 2, 5, 3);
