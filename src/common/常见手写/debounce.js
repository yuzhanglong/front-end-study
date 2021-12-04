// eslint-disable-next-line no-unused-vars
function debounce(fn, time) {
  let timeout;
  return function () {
    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(() => {
      fn.apply(this, arguments);
    }, time);
  };
}
