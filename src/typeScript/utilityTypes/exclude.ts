// Exclude<Type, ExcludedUnion>
// 通过从 Type 中排除所有可分配给 ExcludedUnion 的联合成员来构造类型。

type T0 = Exclude<'a' | 'b' | 'c', 'a' | 'c'>;

// 不合法的表达式
// let a: T0 = "a";

// 合法的表达式
let b: T0 = 'b';

// Exclude
type MyExclude<T, U> = T extends U ? never : T;

type T1 = MyExclude<'a' | 'b' | 'c', 'a' | 'c'>;
