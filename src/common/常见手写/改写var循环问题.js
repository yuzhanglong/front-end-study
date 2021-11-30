for (var i = 0; i < 2; i++) {
  setTimeout(() => {
    console.log(i)
  }, 0)
}

// 下面，不允许使用let, 实现预期输入
for (var i = 0; i < 2; i++) {
  const fn = function () {
    var tmp = i
    setTimeout(() => {
      console.log(tmp)
    }, 0)
  }
  fn()
}
