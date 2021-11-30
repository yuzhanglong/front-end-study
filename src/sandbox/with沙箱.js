// 执行上下文对象
const ctx = {
  func: (variable) => {
    console.log(variable)
  },
  foo: 'foo',
}

// 非常简陋的沙箱
function veryPoorSandbox(code, ctx) {
  with (ctx) {
    // Add with
    eval(code)
  }
}

// 待执行程序
const code = `
    foo = 'bar'
    func(foo)
`

// bar
veryPoorSandbox(code, ctx)
