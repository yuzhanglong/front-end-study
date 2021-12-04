const a = {
  name: 'yzl',
  age: 20,
};

console.log(a);

console.log('name' in a);

const aa = new Proxy(a, {
  has() {
    return false;
  },
});

console.log('name' in aa);
