const add = (...args) => {
  const addFn = (args) => {
    return args.reduce((p, c) => p + c, 0)
  }
  const fn = function (...addition) {
    let concatArgs = args.concat(addition)
    return add(...concatArgs)
  }
  fn.sumOf = function () {
    console.log(addFn(args))
  }
  return fn
}

add(1, 2, 3).sumOf()
add(1)(2)(3).sumOf() //6
add(1, 2)(3).sumOf() //6
add(4, 5)(1)(2, 3).sumOf() //6
add(1, 1)(3)(6).sumOf() //6
