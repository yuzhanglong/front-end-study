// Omit<Type, Keys> 通过从“类型”中选取所有属性，然后删除“键”来构造一个类型。


interface User {
  name: string;
  age: number;
}


// omit 和 pick 的效果相反
let user: Omit<User, "name"> = {
  age: 0
}

// 错误的代码
// let user1: Omit<User, "name"> = {
//   age: 0,
//   name:"21313"
// }

// Omit 原理，利用 pick 来实现，
// 在这里是从 T 中 取到 Exclude<keyof T, K> 的 key
// 而 Exclude<T, U> 表示 T 不为 U 子集的部分，也就是 User 的 key 不为 “name” 子集的部分
// 也就是 age 了
// 然后在使用Pick，拿到 User 中的 “name”
type MyOmit<T, K extends keyof any> = Pick<T, Exclude<keyof T, K>>


