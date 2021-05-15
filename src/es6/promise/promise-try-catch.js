// 同步/异步执行的二元性
// try/catch 抛出错误却没有捕获到
let p
try {
  p = Promise.reject(new Error('bar'))
} catch (e) {
  console.log('抛出异常了吗？')
}

p.then(res => {
  console.log(res)
}).catch(err => {
  // Error
  console.log(err.__proto__.constructor.name)
})

new Promise(() => {
  throw new Error('Error')
}).then(res => {
  console.log(res)
}).catch(() => {
  console.log('此处显示异常')
})
