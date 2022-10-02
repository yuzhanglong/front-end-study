// 自定义迭代器
class Counter {
  // Counter 的实例应该迭代 limit 次
  constructor(limit) {
    this.count = 1;
    this.limit = limit;
  }

  [Symbol.iterator]() {
    let count = 1;
    let limit = this.limit;
    return {
      next() {
        if (count <= limit) {
          return { done: false, value: count++ };
        } else {
          return { done: true, value: undefined };
        }
      },
      return() {
        console.log('Exiting early');
        return { done: true };
      },
    };
  }
}

// let counter = new Counter(3);
//
// for (let i of counter) {
//   console.log(i);
// }
//
// for (let i of counter) {
//   if (i > 2) {
//     break;
//   }
//   console.log(i);
// }

// ================================================================= //
