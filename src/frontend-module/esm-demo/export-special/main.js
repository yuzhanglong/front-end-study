import { name } from './foo.js'

console.log(name)

setTimeout(() => {
  console.log(name)
}, 1000)
