// Required<Type> 构造一个由T的所有属性设置为required的类型。
// 与Partial相反

interface Props {
  a?: number
  b?: string
}

const obj: Props = { a: 5 }

const obj2: Required<Props> = {
  a: 5,
  b: 'hello',
}

// 原理
type MyRequired<T> = {
  // - 表示移除 后面的 ? 标识
  [P in keyof T]-?: T[P]
}
