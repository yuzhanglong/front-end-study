const isPromise = (p) => {
  if ((typeof p === 'object' && p !== null) || typeof p === 'function') {
    return typeof p.then === 'function'
  }
  return false
}

Promise.myAll = (promises) => {
  return new Promise((resolve, reject) => {
    let res = []

    const processData = (index, data) => {
      res[index] = data
      if (res.length === promises.length) {
        resolve(res)
      }
    }

    for (let i = 0; i < promises.length; i++) {
      let currentPromise = promises[i]
      if (isPromise(currentPromise)) {
        currentPromise.then((res) => {
          processData(i, res)
        }, reject)
      } else {
        processData(i, currentPromise)
      }
    }
  })
}

const testPromises = new Array(10).fill(null).map((item, index) => {
  return Promise.resolve('promise ' + index + ' resolved!')
})

Promise.all(testPromises).then((res) => {
  console.log(res)
})
