const { SyncHook } = require('tapable')

const hook = new SyncHook(['name'])

hook.tap('hello', (name) => {
  console.log(`hello ${name}`)
})

hook.tap('hello again', (name) => {
  console.log(`hello ${name}, again`)
})

hook.call('world')