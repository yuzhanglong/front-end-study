// Pick<Type, Keys> 通过从 Type 中选择 Keys 存在的值来构造新的类型

interface User {
  name: string
  age: number
  hobby: string
}

let user1: Pick<User, 'name' | 'age'> = {
  age: 20,
  name: 'yzl',
}

// Pick 的原理

type MyPick<T, K extends keyof T> = {
  [P in K]: T[P]
}

// 首先，K 必须是 T 的所有键组成的集合的子集，其次，新的对象的 key 为 K 的每一个元素。
