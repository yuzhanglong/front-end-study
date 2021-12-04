let foo = {
  a: 1,
  b: 2,
};

let number = 1;

setTimeout(() => {
  console.log(foo);
  console.log(number);
}, 2000);

export { foo, number };
