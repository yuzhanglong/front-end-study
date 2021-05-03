// 节流函数
// 连续触发时每 n ms 执行一次
// eslint-disable-next-line no-unused-vars
function throttle(fn, time) {
  let showRun = true
  return function() {
    if (!showRun) {
      return
    }
    showRun = false
    setTimeout(() => {
      fn.apply(this, arguments)
      showRun = true
    }, time)
  }
}

