// function f(num) {
//   if (!this.number) {
//     this.number = 0;
//   }
//   if (num) {
//     this.number += num;
//     return f.bind(this);
//   } else {
//     console.log(this.number);
//     this.number = undefined;
//   }
// }
//
// f(1)() // 1
//
// f(1)(2)(3)() // 6
//
// f(1)(2)(3)(4)() // 10


// const f2 = (num, sum = 0) => {
//   if (!num) {
//     console.log(sum);
//   } else {
//     return (arg) => {
//       return f2(arg, sum + num);
//     }
//   }
// }
//
// f2(1)() // 1
// f2(1)(2)(3)() // 6
// f2(1)(2)(3)(4)() // 10


const f3 = (args = []) => {
  const getSum = (...args) => {
    return args.reduce((p, c) => p + c, 0);
  }
  if (args.length) {
    return (...addition) => {
      let preSum = getSum(...args);
      return f3([preSum].concat(addition));
    }
  } else {
    console.log(args[0]);
  }
}

f3(1, 3)() // 1
// f3(1)(2, 5)(3)() // 6
// f3(1)(2, 5, 6)(3, 3)(4)() // 10
