// 构造一个 with 来包裹需要执行的代码，返回 with 代码块的一个函数实例
function withedYourCode(code) {
  code = 'with(globalObj) {' + code + '}'
  return new Function('globalObj', code)
}

// 可访问全局作用域的白名单列表
const access_white_list = ['Math', 'Date']

// 待执行程序
const code = `
    Math.random()
    location.href = 'xxx'
    func(foo)
`

// 执行上下文对象
const ctx = {
  func: (variable) => {
    console.log(variable)
  },
  foo: 'foo',
}

// 执行上下文对象的代理对象
const ctxProxy = new Proxy(ctx, {
  has: (target, prop) => {
    // has 可以拦截 with 代码块中任意属性的访问
    if (access_white_list.includes(prop)) {
      // 在可访问的白名单内，可继续向上查找
      return target.hasOwnProperty(prop)
    }

    if (!target.hasOwnProperty(prop)) {
      throw new Error(`Invalid expression - ${prop}! You can not do that!`)
    }

    return true
  },
})

// 没那么简陋的沙箱

function littlePoorSandbox(code, ctx) {
  withedYourCode(code).call(ctx, ctx) // 将 this 指向手动构造的全局代理对象
}

littlePoorSandbox(code, ctxProxy)

// Uncaught Error: Invalid expression - location! You can not do that!
