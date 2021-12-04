// NonNullable<Type> 通过从 Type 中排除 null 和 undefined 来构造一个类型。

type T0 = NonNullable<string | number | undefined>;

type T1 = NonNullable<string[] | null | undefined>;

let a: T0 = 'aaa';
// 错误的表达式
// let a:T0 = undefined;

// 原理：
// 判断类型 T 是否为 联合类型 null | undefined 的子集，如果是，返回 never 否则返回这个类型 T
type MyNonNullable<T> = T extends null | undefined ? never : T;
