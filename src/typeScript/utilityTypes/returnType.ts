// ReturnType<Type>构造一个由函数Type的返回类型组成的类型。
type T0 = ReturnType<() => string>

let T1: T0 = 'hello world'

// 错误的表达式
// let T2: T0 = false;

// 原理
// 如果 T 是 (...args: any) 的子集，这里的 infer R 表示待推断的返回值类型
type MyReturnType<T extends (...args: any) => any> = T extends (
  ...args: any
) => infer R
  ? R
  : any
