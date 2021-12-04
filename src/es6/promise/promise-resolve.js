const p = new Promise((res) => {
  setTimeout(() => {
    console.log('hello world');
    res('hello~');
  }, 1000);
});

const t = Promise.resolve(p);
console.log(t === p);
t.then((r) => {
  console.log(r);
});
