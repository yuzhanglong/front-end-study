# Typescript Utility Types 解读

typescript 有一套 **Utility Types**（实用工具类型），非常有意思。本文将介绍它们，并探究其原理。

## 大纲

[[toc]]

## Partial<Type>

Partial 意为 “部分的”，见文知意，就是所有属性都可选。`Partial<Type>` 用于构造一个类型，并将Type的**所有属性设置为可选**，来看下面这个案例：

```typescript
interface User {
  name: string,
  age: number
}

const entireUser: User = {
  age: 20,
  name: "yzl"
}

type T0 = Partial<User>;

// T0 = {name?: string, age?: number}

const partialUser: T0 = {
  age: 10
}
```

下面这个写法就是错误的：

```typescript
const badUser: Partial<User> = {
  age: 10,
  name: "yzl2",
  hobby: "coding" //:  Type '{ age: number; name: string; hobby: string; }' is not assignable to type 'Partial<User>'.
}
```

它的实现如下：

```typescript
type Partial<T> = {
  [P in keyof T]?: T[P];
};
```

这里顺便介绍一下 keyof，它的运算结果是一个联合类型，`keyof T` 表示 T 中所有 key 的联合：

```typescript
type T1 = keyof {
  age: 10,
  name: "yzl",
}

// T1 = "age" | "name"
```

新类型是一个**对象**，`P in keyof T` 表示新对象的所有 key 为 联合类型 `keyof T` 的每一个元素。 因此它的每个键仍然是 `T` 的键，但是我们利用 `?:` 其被设置为**可选**。

## Required<Type>

介绍完 Partial，顺便介绍一下和它完全相对的类型 `Required`。

`Required<Type>` 构造一个由T的所有属性设置为 required 的类型。

```typescript
interface Props {
  a?: number;
  b?: string;
}

const obj: Props = {
  a: 5
};

const obj1: Required<Props> = {
  a: 5,
  b: "hello"
};
```

下面是错误的代码：

```typescript
const obj1: Required<Props> = {
  a: 5
  // Property 'b' is missing in type '{ a: number; }' but required in type 'Required<Props>'.
};
```

其原理和 `Partial` 几乎相似：

```typescript
type MyRequired<T> = {
  [P in keyof T]-?: T[P];
};
```

这里的 `-` 表示移除 `?` 标识，也就是全部设置为必选项。

## Readonly<Type>

这个类型用来构一个 Type 的所有属性都设置为 readonly 的类型：

```typescript
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
```

下面的代码就是错误的:

```typescript
readOnlyUser.name = "yzl"  // Cannot assign to 'name' because it is a read-only property.
```

经过上面两个类型的讲解，我们不难得出 `Readonly<Type>` 的实现，它利用 `readonly` 标记 key 的所有项：

`readonly` 用来标记一个类型是否为只读类型。

```typescript
type Readonly<T> = {
  readonly [P in keyof T]: T[P];
};
```

## Record<Keys,Type>

`Record<Keys,Type>` 构造具有一组类型为 `Type` 的属性的键的类型。

该实用程序可用于将一个类型的属性映射到另一个联合类型上，构造一个新的对象类型。

听起来有点抽象，来看实例：

```typescript
interface Word {
  chinese: string;
  startWith: string;
}

type TotalWords = "age" | "hobby";

type T1 = Record<TotalWords, Word>; // T1 = {age: Word, hobby: Word}

let user: T1 = {
  age: {
    chinese: "年龄",
    startWith: "a"
  },
  hobby: {
    chinese: "爱好",
    startWith: "h"
  }
}
```

可以看出，新的对象每一个 key 都是 联合类型 `Keys` 的每一个成员，每一个 key 对应的 value 都是 `Word` 类型。

来看其原理：

```typescript
type MyRecord<K extends keyof any, T> = {
  [P in K]: T;
};
```

`keyof any` 是一个联合类型，表示 `string | number | symbol`，这个怎么理解？其实这就是**可以用作对象索引的任何值的类型**。

这里顺便再介绍一下 `extends`，这表示 K 必须是 `string | number | symbol` 的子集，来看下面这个例子：

```typescript
type Foo<T extends string | number | symbol> = T;


type T1 = string;
type T2 = number;
type T3 = symbol;
type T4 = Foo<string | symbol>;
// 错误的代码
type T5 = Foo<string | object>;  // Type 'string | object' does not satisfy the constraint 'string | number | symbol'.
```

所以新对象的 key 满足 `P in K`，即所有 key 必须是 `K` 的每一个元素，且每个 key 的类型为 `T`。
