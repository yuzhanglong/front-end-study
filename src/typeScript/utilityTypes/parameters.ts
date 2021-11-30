// Parameters<Type> 从函数类型 Type 的参数中使用的类型构造一个元组类型。

type T0 = Parameters<() => string>

type T1 = Parameters<(s: string) => void>

// 原理：
// type MyParameters<T extends (...args: any) => any>
// = T extends (...args: infer P) => any ? P : never;
// 毋庸置疑，T extends (...args: any) => any 约束了 T 必须是一个函数类型
// infer P 表示待推断的函数参数，
// 也就是 T 如果能作为这个函数的参数，返回 P 否则返回 never
// 举个例子，例如上面的 T1
// T1 = (s: string) => void extends (...args: any)，没问题
//  (s: string) => void extends (...args: infer P) => any ? P : never

// 也就是 string extends infer P
// 也就是 (string | P的第一个参数) | (string | P的第二个参数)......
// 也就是 string | never | never | ....
