const promise1 = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve('promise1 resolved!');
    }, 1000);
  });
};

const promise2 = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve('promise2 resolved!');
    }, 1000);
  });
};

const promise3 = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve('promise3 resolved!');
    }, 1000);
  });
};

// 一般方法
// promise1()
//   .then(res => {
//     console.log(res);
//     return promise2();
//   })
//   .then(res => {
//     console.log(res);
//     return promise3();
//   })
//   .then(res => {
//     console.log(res);
//   })

const foo = async () => {
  let res1 = await promise1();
  console.log(res1);
  let res2 = await promise2();
  console.log(res2);
  let res3 = await promise3();
  console.log(res3);
};

foo().then((res) => {
  console.log(res);
});
