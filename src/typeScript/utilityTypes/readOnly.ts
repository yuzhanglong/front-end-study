// readOnly<Type> 类型，构造一个Type的所有属性都设置为readonly的类型
// 这意味着无法重新分配所构造类型的属性。

interface User {
  name: string,
  age: number
}

let user: User = {
  name: "yzl",
  age: 20
}

let readOnlyUser: Readonly<User> = {
  age: 20,
  name: "yzl2"
}

// 下面的代码就是错误的
// readOnlyUser.name = "yzl"
// Cannot assign to 'name' because it is a read-only property.

// 这里可以了解一下 Object.freeze
// 可参考 https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Object/freeze


// Readonly 的本质如下，它利用 readonly 标记 key 的所有项
type MyReadonly<T> = {
  readonly [P in keyof T]: T[P];
};


