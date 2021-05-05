function f(num) {
  if (!this.number) {
    this.number = 0
  }
  if (num) {
    this.number += num
    return f.bind(this)
  } else {
    console.log(this.number)
    this.number = undefined
  }
}

f(1)() // 1

f(1)(2)(3)() // 6

f(1)(2)(3)(4)() // 10


const f2 = (num, sum = 0) => {
  if (!num) {
    console.log(sum)
  } else {
    return (arg) => {
      return f2(arg, sum + num)
    }
  }
}

f2(1)() // 1
f2(1)(2)(3)() // 6
f2(1)(2)(3)(4)() // 10
