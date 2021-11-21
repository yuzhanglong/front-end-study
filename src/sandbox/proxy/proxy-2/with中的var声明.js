// 这不是八股文，这是微前端沙箱机制逃不过的一个问题！！！！！

var obj = {
  a: 1
};

(function() {
  var b = 1
  with (obj) {
    var a = 4444  // 这里的 a 会覆写 obj 中的 a, 当且仅当 obj 里面有 a 属性
    var b = 7777  //
  }
  console.log(7777) // 输出 7777 -- 说明如果不满足上面的条件（obj 里面有 b 属性）
  // x 会被定义在外围函数的作用域上
})()


console.log(obj.a)     // 4444
console.log(obj.b)     // 这里就不会覆写
console.log(global.a)  // undefined
