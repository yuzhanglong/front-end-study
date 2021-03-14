const EventEmitter = require('events')

const emitter = new EventEmitter()

emitter.on('click', (args) => {
  console.log(args)
  console.log('click!')
})

emitter.on('click', (args) => {
  console.log(args)
  console.log('click2!')
})

emitter.on('hello', (args) => {
  console.log(args)
  console.log('hello')
})


emitter.emit('click', 'yzl')

console.log(emitter.eventNames())
console.log(emitter.listenerCount('click'))


// 继承方式使用 EventEmitter 很多的 js 库偏爱这种方式
class MyEvent extends EventEmitter {
  constructor() {
    super()
  }

  sayHello() {
    this.emit('hello')
  }
}

const e = new MyEvent()

e.on('hello', () => {
  console.log('event hello!')
})

e.sayHello()