// InstanceType<Type>
// 在Type中构造一个由构造函数的实例类型组成的类型。

class C {
  x = 0
  y = 0
}

type T0 = InstanceType<typeof C>

let a: T0 = new C()

// 原理，就是拿到其 return type
type MyInstanceType<T extends new (...args: any) => any> = T extends new (
  ...args: any
) => infer R
  ? R
  : any
