// Partial<Type> 用于构造一个类型，并将Type的所有属性设置为可选。
// 该实用程序将返回一个表示给定类型的所有子集的类型。

interface User {
  name: string;
  age: number;
}

const entireUser: User = {
  age: 20,
  name: 'yzl',
};

const partialUser: Partial<User> = {
  age: 10,
};

// 下面这个写法就是错误的
// const badUser: Partial<User> = {
//   age: 10,
//   name: "yzl2",
//   hobby: "coding" //:  Type '{ age: number; name: string; hobby: string; }' is not assignable to type 'Partial<User>'.
// }

// partial 的本质
type MyPartial<T> = {
  [P in keyof T]?: T[P];
};

// keyof 本质上产生的是一个联合类型
// 也就是将 T 的所有 key 组成一个联合类型
// 以上面的代码为例，
// keyof T = keyof User = "age" | "name"
// P in 表示类型 P 为 "age" | "name" 的一项
// ?：全部标记为可选项
