// 节流函数
// 连续触发时每 n ms 执行一次
// eslint-disable-next-line no-unused-vars
function throttle(fn, time) {
  let isAllowRun = true;
  return function () {
    if (!isAllowRun) {
      return;
    }
    isAllowRun = false;
    setTimeout(() => {
      fn.apply(this, arguments);
      isAllowRun = true;
    }, time);
  };
}
