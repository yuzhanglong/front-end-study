const { AsyncParallelHook } = require('tapable')

const hook = new AsyncParallelHook(['name'])

hook.tapPromise('hello', async (name) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log(`hello ${name} after 1s!`)
      resolve()
    }, 1000)
  })
})

hook.tapPromise('hello again', async (name) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log(`hello ${name} after 1s!`)
      resolve()
    }, 1000)
  })
})

hook.tapPromise('hello again', async (name) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log(`hello ${name} after 1s!`)
      resolve()
    }, 1000)
  })
})

hook.tapPromise('hello again', async (name) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log(`hello ${name} after 1s!`)
      resolve()
    }, 1000)
  })
})

hook.promise('call-end').then(() => {
  console.log('hello!')
})