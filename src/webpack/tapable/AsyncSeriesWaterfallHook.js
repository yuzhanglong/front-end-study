const { AsyncSeriesWaterfallHook } = require('tapable')

const hook = new AsyncSeriesWaterfallHook(['name'])

hook.tapAsync('hello', async (name, cb) => {
  await setTimeout(() => {
    console.log(`hello ${name} after 1s!`)
    cb(null, 'Jim')
  }, 1000)
})

hook.tapAsync('hello again', async (name, cb) => {
  await setTimeout(() => {
    console.log(`hello ${name}, again after 1s!`)
    cb(null, 'Frank')
  }, 1000)
})

hook.tapAsync('hello again', async (name, cb) => {
  await setTimeout(() => {
    console.log(`hello ${name}, again after 1s!`)
    cb(null, 'Amy')
  }, 1000)
})

hook.tapAsync('hello again', async (name, cb) => {
  await setTimeout(() => {
    console.log(`hello ${name}, again after 1s!`)
    cb(null)
  }, 1000)
})

hook.callAsync('world', () => {
  console.log('end!')
})