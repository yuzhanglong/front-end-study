// Pick<Type, Keys> 通过从 Type 中选择 Keys 存在的值来构造新的类型

interface User {
  name: string,
  age: number,
  hobby: string;
}


let user1: Pick<User, "name" | "age"> = {
  age: 20,
  name: "yzl"
}


// Pick 的原理

type MyPick<T, K extends keyof T> = {
  [P in K]: T[P];
};

// K extends keyof T
// keyof T 表示 T 所有 key 的联合类型，K 继承之


