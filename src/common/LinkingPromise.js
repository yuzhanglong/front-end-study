// 链式的 Promise

const promises = new Array(10).fill(null).map((item, index) => {
  return () => {
    return Promise.resolve("promise " + index + " resolved!");
  }
});

const reducer = (promise, guard) => {
  return promise.then((res) => {
    console.log(res);
    return guard(res);
  });
}

promises.reduce(reducer, Promise.resolve());

