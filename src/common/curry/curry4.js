function powByExponent(exponent) {
  return (x) => {
    return Math.pow(x, exponent)
  }
}

function mapFromZeroToOne(start, end) {
  return (x) => {
    return (x - start) / (end - start)
  }
}

function mapToRange(start, end) {
  return (x) => {
    return x * (end - start) + start
  }
}

function compose(...fns) {
  return fns.reduce((preFn, currentFn) => {
    return (x) => currentFn(preFn(x))
  })
}

// 二次方
const fn1 = powByExponent(2)
// 线性变换到 [0 - 1] 区间
const fn2 = mapFromZeroToOne(0, 100 * 100)
// 线性变换到用户给定的值域
const fn3 = mapToRange(0, 100)

compose(fn1, fn2, fn3)(25) // 6.25
