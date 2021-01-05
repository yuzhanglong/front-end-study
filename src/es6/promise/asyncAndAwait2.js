const myPromise = () => new Promise((resolve) => {
  setTimeout(() => {
    resolve("promise resolved!");
  }, 1000);
});


const next = async () => {
  let res = await myPromise();
  console.log(res);
}


const foo = () => {
  console.log("hello world");
  next();
  console.log("hello world 2");
}



foo();