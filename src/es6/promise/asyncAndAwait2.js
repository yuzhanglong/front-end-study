const myPromise = () =>
  new Promise((resolve) => {
    setTimeout(() => {
      resolve('promise resolved!')
    }, 1000)
  })

const m1 = () => {
  console.log('hello')
}

const m2 = async () => {
  let res = await myPromise()
  console.log(res)
}

const fn1 = () => Promise.resolve(m1())
const fn2 = () => Promise.resolve(m2())
fn1()
fn2()
