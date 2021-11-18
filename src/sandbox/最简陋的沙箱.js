// 程序中访问的所有变量均来自可靠或自主实现的上下文环境而不会从全局的执行环境中取值，
// 那么要实现变量的访问均来自一个可靠上下文环境，我们需要为待执行程序构造一个作用域：
// 执行上下文对象
const ctx = {
  func: variable => {
    console.log(variable)
  },
  foo: 'foo'
}

// 最简陋的沙箱
function poorestSandbox(code) {
  eval(code) // 为执行程序构造了一个函数作用域
}

// 待执行程序
const code = `
    ctx.foo = 'bar'
    ctx.func(ctx.foo)
`

poorestSandbox(code, ctx) // bar

// 这样的一个沙箱要求源程序在获取任意变量时都要加上执行上下文对象的前缀，这显然是非常不合理的
