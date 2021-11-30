const createApp = () => {
  const stack = []

  const use = (middleware) => {
    stack.push(middleware)
  }

  const next = (req, res) => {
    // 尝试拿到第一个中间件
    const middleware = stack.shift()

    if (middleware) {
      try {
        middleware(req, res, next)
      } catch (e) {
        console.log(e)
      }
    }
  }

  const handleRequest = () => {
    const req = 'req'
    const res = 'res'
    next(req, res)
  }

  return {
    use,
    handleRequest,
  }
}

const app = createApp()

app.use((req, res, next) => {
  console.log(req)
  console.log(res)
  console.log('1')
  next()
})

app.use((req, res, next) => {
  console.log('2')
  next()
})

app.use((req, res, next) => {
  console.log('3')
  next()
})

app.handleRequest()
