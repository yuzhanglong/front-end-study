// 中断方案1 本质上利用了闭包
let cancelToken = undefined;
const myPromise = new Promise((resolve, reject) => {
  let timeout = setTimeout(() => {
    resolve("promise resolved!");
  }, 3000);

  cancelToken = () => {
    clearTimeout(timeout);
    reject("promise rejected!");
  };
});

myPromise
  .then(res => {
    console.log(res);
  })
  .catch(err => {
    console.log(err);
  });

cancelToken();

// 中断方案2 基于 promise.race()
let t = undefined;
const cancelablePromise = (promise) => {
  let p2 = new Promise((resolve, reject) => {
    setTimeout(() => {
      reject('超过 1s，中断 promise！');
      clearTimeout(t);
    }, 1000);
  });
  return Promise.race([promise, p2]);
}


const myPromise2 = new Promise((resolve, reject) => {
  t = setTimeout(() => {
    resolve("promise resolved!");
  }, 3000);
});

cancelablePromise(myPromise2)
  .then(res => {
    console.log(res);
  })
  .catch(err => {
    console.log(err);
  })



