---
date: 2020-12-20

tags:

- TypeScript
---
# Typescript Utility Types 解读

Typescript 有一套 **Utility Types**（实用工具类型），非常有意思，本文将介绍它们，并探究其原理：

[[toc]]

## Partial

`Partial<Type>` 意为 “部分的”，见文知意，就是所有属性都可选。`Partial<Type>` 用于构造一个类型，并将 Type 的**所有属性设置为可选**，来看下面这个案例：

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

这里顺便介绍一下 `keyof`，它的结果是一个联合类型，`keyof T` 表示 T 中所有 key 的**联合**：

```typescript
type T1 = keyof {
  age: 10,
  name: "yzl",
}

// T1 = "age" | "name"
```

新类型是一个**对象**，`P in keyof T` 表示新对象的所有 key 为 联合类型 `keyof T` 的每一个元素。 因此它的每个键仍然是 `T` 的键，但是我们利用 `?:` 其被设置为**可选**。

## Required

介绍完 `Partial`，顺便介绍一下和它完全相对的类型 `Required<Type>`。

`Required<Type>` 构造一个由 T 的所有属性设置为 `required` 的类型。

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

这里的 `-` 表示移除 `?` 标识，也就是全部设置为**必选项**。

## Readonly

`Readonly<Type>` 用来构一个 Type 的所有属性都设置为 `readonly` 的类型：

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

## Record

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

这里顺便再介绍一下 `extends`，把 K 看成一个联合类型，他会被拆分，拆分之后的每一个类型必须在 `string | number | symbol` 存在，来看下面这个例子：

```typescript
type Foo<T extends string | number | symbol> = T;


type T1 = string;
type T2 = number;
type T3 = symbol;
type T4 = Foo<string | symbol>; // string 存在  symbol 也存在
// 错误的代码
type T5 = Foo<string | object>;  // Type 'string | object' does not satisfy the constraint 'string | number | symbol'.
```

所以新对象的 key 满足 `P in K`，即所有 key 必须是 `K` 的每一个元素，且每个 key 的类型为 `T`。

## Pick

`Pick<Type, Keys>` 通过从 Type 中选择 Keys 存在的值来构造新的类型，来看下面的代码：

```typescript
interface User {
  name: string,
  age: number,
  hobby: string;
}


let user1: Pick<User, "name" | "age"> = {
  age: 20,
  name: "yzl"
}
```

其原理也很简单：

```typescript
type Pick<T, K extends keyof T> = {
  [P in K]: T[P];
};
```

首先，联合类型 K 的所有子类型必须在 T 的所有键组成的集合存在，其次，新的对象的 key 为 K 的每一个元素。

例如上面的 `"name" | "age" extends keyof User` 等价于 `"name" | "age" extends keyof "name" | "age" | "hobby"`

## Exclude

`Exclude<Type, ExcludedUnion>` 通过从 `Type` 中排除所有可分配给 `ExcludedUnion` 的联合成员来构造类型：

```typescript
type T0 = Exclude<"a" | "b" | "c", "a" | "c">;

//  不合法的表达式
// let a: T0 = "a";
```

Exclude 的原理如下：

```typescript
type Exclude<T, U> = T extends U ? never : T;
```

这里有一个三元运算符，很好理解。联合类型 `T` 会被进行拆分，如果成员是 `U` 的子集，则这个类型不存在，否则返回 `T`，最终它会返回一个联合类型。

## Omit

`Omit<Type, Keys>` 通过从“类型”中选取所有属性，然后删除“键”来构造一个类型，实际上他和上面说到的 `Pick` 是相对的：

```typescript
interface User {
  name: string;
  age: number;
}


// omit 和 pick 的效果相反
let user: Omit<User, "name"> = {
  age: 0
}
```

下面的代码是错误的：

```typescript
let user1: Omit<User, "name"> = {
  age: 0,
  name: "21313" // ERROR！
  // Type '{ age: number; name: string; }' is not assignable to type 'Pick<User, "age">'.
}
```

`Omit` 的原理是利用 `Pick` 的，来看代码：

```typescript
type Omit<T, K extends keyof any> = Pick<T, Exclude<keyof T, K>>
```

这里用到了我们上面说到的 `Exclude`, 这里的 `Exclude<keyof T, K>` 表示 `keyof T` 中排除所有可分配给 `K` 的联合成员。

接着使用之前说过的 `Pick<T, K>`，保证 `Exclude` 得到的成员在 `T` 中也存在。

## Extract

它通过从 Type 中提取可分配给 `Union` 的所有 `Union` 成员来构造类型。

```typescript
type T0 = Extract<"a" | "b" | "c", "a" | "f">;
```

其原理如下:

```typescript
type MyExtract<T, U> = T extends U ? T : never;
```

如果 T 的所有子项是 U 的子集，则返回 T，否则这个类型不存在，这和上面提到的 `exclude` 是相反的。

## NonNullable

`NonNullable<Type>` 通过从 Type 中排除 `null` 和 `undefined` 来构造一个类型。

```typescript
type T0 = NonNullable<string | number | undefined>;

type T1 = NonNullable<string[] | null | undefined>;
```

```typescript
let a: T0 = "aaa";
// 错误的表达式
// let a:T0 = undefined;
```

其原理也是利用 `extends`：

```typescript
type MyNonNullable<T> = T extends null | undefined ? never : T;
```

判断联合类型 `T` 的每一个成员是否为联合类型 `null | undefined` 的子集，如果是，返回 `never` ，否则返回这个类型 `T`。

## Parameters

`Parameters<Type>` 从函数类型 Type 的参数中使用的类型构造一个元组类型：

```typescript
type T1 = Parameters<(s: string) => void>;  // [string]
```

原理如下：

```typescript
type Parameters<T extends (...args: any[]) => any>
  = T extends (...args: infer P) => any ? P : never;
```

首先，约束了 `T` 必须是一个函数类型。`infer P` 表示待推断的函数参数，也就是说 `T` 如果能作为这个函数的参数，返回 P 否则返回 `never`。

## ConstructorParameters

`ConstructorParameters<Type>` 从构造函数类型的类型构造元组或数组类型。它会生成具有所有参数类型的元组类型。

下面举一个构造函数类型的例子，常用于构造工厂函数：

```typescript
interface Point {
  x: number;
  y: number;
}

interface PointConstructor {
  new(x: number, y: number): Point;
}

class Point2D implements Point {
  readonly x: number;
  readonly y: number;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }
}

function newPoint(
  pointConstructor: PointConstructor,
  x: number,
  y: number
): Point {
  return new pointConstructor(x, y);
}

const point: Point = newPoint(Point2D, 2, 2);


type T0 = ConstructorParameters<PointConstructor>

// [number, number]

let a: T0 = [1, 2];
```

其原理如下：

```typescript
// 原理
type MyConstructorParameters<T extends new (...args: any[]) => any>
  = T extends new (...args: infer P) => any ? P : never;
```

如果 `T` 可以赋值给 `new (...args: infer P)` 则返回 `P` ，也就是待推断的函数参数。

## ReturnType

`ReturnType<Type>` 构造一个由函数 Type 的返回类型组成的类型。

```typescript
type T0 = ReturnType<() => string>;

let T1: T0 = "hello world";

// 错误的表达式
// let T2: T0 = false;
```

原理也是利用了 `infer`：

```typescript
type MyReturnType<T extends (...args: any[]) => any> = T extends (...args: any[]) => infer R ? R : any;
```

## InstanceType

`InstanceType<Type>` 在 Type 中构造一个由构造函数的实例类型组成的类型。

```typescript
class C {
  x = 0;
  y = 0;
}

type T0 = InstanceType<typeof C>;

let a: T0 = new C();
```

原理和 `ReturnType<Type>` 极其相似：

```typescript
type MyInstanceType<T extends new (...args: any[]) => any>
  = T extends new (...args: any[]) => infer R ? R : any;
```

## ThisParameterType

`ThisParameterType<Type>` 用来提取函数类型的 `this` 参数的类型，如果函数类型没有 `this` 参数，则提取此参数的类型。

这个东西用来干什么？它是用来防止函数在不适合调用的上下文调用，来看下面代码：

```typescript
function addX(this: { x: number }, y: number): number {
  return this.x + y;
}

const val = {
  x: 123,
  addX: addX
};
val.addX(10); // okay, you're calling it as a method of type {x: number}

// addX(10); // error!  you can't call this function by itself


let a: ThisParameterType<typeof addX>; //  a: {x: number}
```

原理同样利用了 infer，只不过变成了推断 this 的类型：

```typescript
type MyThisParameterType<T> = T extends (this: infer U, ...args: any[]) => any ? U : unknown;
```

## OmitThisParameter

`OmitThisParameter<Type>` 从“类型”中删除 this 参数。 如果 Type 没有显式声明此参数，则结果就是 Type。 否则，将从 Type 中创建一个没有此参数的新函数类型。

```typescript
function addX(this: { x: number }, y: number): number {
  return this.x + y;
}

const val = {
  x: 123,
  addX: addX
};
val.addX(10); // okay, you're calling it as a method of type {x: number}

// addX(10); // bad

const unsafeAddX: OmitThisParameter<typeof addX> = addX;
unsafeAddX(10);
//this 参数被删除
```

原理:

```typescript
type MyOmitThisParameter<T>
  = unknown extends ThisParameterType<T> ?
  T : T extends (...args: infer A) => infer R ?
    (...args: A) => R : T;
```

如果没有显式声明 `this`, 那么 `ThisParameterType<T>` 会返回 `unknown`，则结果就是 Type。

如果声明了 this，则 `ThisParameterType<T>` 会获取到 `this` 的类型

后面的内容表示 如果 T 是一个函数，则创建一个没有 `this` 的新函数类型，否则返回 T。

## ThisType

`ThisType<Type>` 可以方便地控制 `this` 类型，它只有在 `--noImplicitThis` 的选项下才有效。

```typescript
interface HelperThisValue {
  logError: (error: string) => void;
}

let helperFunctions: { [name: string]: Function } & ThisType<HelperThisValue> = {
  hello: function () {
    this.logError("Error: Something went wrong!");
    this.update(); // 编译时会发现错误：Property 'update' does not exist on type 'HelperThisValue'.
  }
}
```

ThisType 的原理如下所示：

```typescript
/**
 * Marker for contextual 'this' type
 */
interface ThisType<T> {
}
```

一个空接口，它**不返回任何转换过的类型**，而是作为**对象字面量**上下文 this 的标识，并且要使用这个类型，需要启用配置 -noImplicitThis 。

那么上面 `helperFunctions` 的 this 指向就是 `HelperThisValue`。

## 补充 -- extends 和 infer 的各种混用

试理解下面的类型：

```typescript
// 把 T 看成一个联合类型，然后拆分之，如果其每一个成员都是 extends 右边的子集，则符合 extends 条件
type Foo<T extends "aaa" | "bbb"> = T;

type T0 = Foo<"aaa" | "bbb">; // 合法
// type T1 = Foo<"ccc" | "bbb">;  // 不合法

// 同样的道理，拆分每一个成员，逐一判断，如果是 “aaa” | "bbb" 的子集，则返回 T 否则返回 boolean;
type Bar<T> = T extends "aaa" | "bbb" ? T : boolean;

// T2 =  "aaa" | boolean
type T2 = Bar<"aaa" | "ccc">;

type Baz<T> = T extends (...args: infer A) => any ? A : T;

// T3 = [string] | [symbol]，注意，infer A 中的 A 是一个联合类型
type T3 = Baz<((a: string) => void) | ((b: symbol) => boolean)>;

type Baz2<T> = T extends (...args: any[]) => infer R ? R : T;

// T4 = void
type T4 = Baz2<(a: string, b: boolean) => void>;

type Baz3<T> = T extends (...args: infer A) => infer R ? (...args: A) => R : undefined;

// T5 = ((a: string, b: boolean) => boolean) | undefined
type T5 = Baz3<((a: string, b: boolean) => boolean) | string>;
```
