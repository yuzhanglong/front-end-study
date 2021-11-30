/*
 * File: demo.js
 * Description: thread worker demo
 * Created: 2021-3-7 18:40:15
 * Author: yuzhanglong
 * Email: yuzl1123@163.com
 */

const { Worker, isMainThread, parentPort } = require('worker_threads')

if (isMainThread) {
  const worker = new Worker(__filename)
  worker.once('message', (message) => {
    console.log(message) // Prints 'Hello, world!'.
  })
  worker.postMessage('Hello, world!')
} else {
  // When a message from the parent thread is received, send it back:
  parentPort.once('message', (message) => {
    parentPort.postMessage(message)
  })
}
