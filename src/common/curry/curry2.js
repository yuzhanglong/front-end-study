const foo = (fn, args = []) => {
  return (...addition) => {
    let arg = args.concat(addition);
    if (addition.length) {
      return foo(fn, arg);
    } else {
      return fn(arg);
    }
  }
};

const add = (args) => {
  return args.reduce((p, c) => p + c, 0);
};

const fn = foo(add);

console.log(fn(1)()); // 1
console.log(fn(1)(2)(3)()); // 6
console.log(fn(1)(2)(3)(4)()); // 10
console.log(fn(5, 3, 4)(1, 3)(3)(1, 5)(5, 4)(3)()); // 37


