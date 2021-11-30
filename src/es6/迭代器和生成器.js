// 自定义迭代器
class Counter {
  // Counter 的实例应该迭代 limit 次
  constructor(limit) {
    this.count = 1
    this.limit = limit
  }

  [Symbol.iterator]() {
    let count = 1
    let limit = this.limit
    return {
      next() {
        if (count <= limit) {
          return { done: false, value: count++ }
        } else {
          return { done: true, value: undefined }
        }
      },
      return() {
        console.log('Exiting early')
        return { done: true }
      },
    }
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

function* bar() {
  console.log('hi~')
  // 利用 setTimeout 模拟网络请求
  const res1 = yield new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve('hello world!')
    }, 1000)
  })
  const res2 = yield new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve('yzl!')
    }, 1000)
  })
  console.log(res1)
  console.log(res2)
}

const iterator = bar()
let it1 = iterator.next()

it1.value.then((res) => {
  let it2 = iterator.next(res)
  it2.value.then((res) => {
    iterator.next(res)
  })
})

// const generatorRunner = (fn) => {
//   let iterator = fn();
//
//   const next = (res = undefined) => {
//     let result = iterator.next(res);
//     if (result.done) {
//       return;
//     }
//     result.value.then(res => {
//       next(res);
//     });
//   }
//   next();
// }
//
// generatorRunner(bar);
