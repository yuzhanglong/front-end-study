const p1 = () =>
  new Promise((resolve) => {
    console.log('p1');
    setTimeout(() => {
      resolve('hello p1!');
    }, 1000);
  });

const p2 = () =>
  new Promise((resolve) => {
    console.log('p2');
    setTimeout(() => {
      resolve('hello p2!');
    }, 2000);
  });

const p3 = () =>
  new Promise((resolve) => {
    console.log('p3');
    setTimeout(() => {
      resolve('hello p3!');
    }, 3000);
  });

function* asyncFunction() {
  console.log('asyncFunction start!');
  const res1 = yield p1();
  const res2 = yield p2();
  const res3 = yield p3();

  console.log(res1);
  console.log(res2);
  console.log(res3);
}

async function asyncFunction2() {
  const res1 = await p1();
  const res2 = await p2();
  const res3 = await p3();

  console.log(res1);
  console.log(res2);
  console.log(res3);
}

const handlePromise = (generator) => {
  const iterator = generator();

  const next = (result) => {
    let { value, done } = iterator.next(result);

    if (done) {
      return;
    }

    value.then((res) => {
      next(res);
    });
  };

  next(undefined);
};

handlePromise(asyncFunction);
// asyncFunction2();
