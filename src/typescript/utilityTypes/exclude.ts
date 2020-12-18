// Exclude<Type, ExcludedUnion>
// 通过从 Type 中排除所有可分配给 ExcludedUnion 的联合成员来构造类型。

type T0 = Exclude<"a" | "b" | "c", "a" | "c">;

// 不合法的表达式
// let a: T0 = "a";

// 合法的表达式
let b: T0 = "b";

// Exclude 的本质
// 如果 T 包含的类型不是 U 包含的类型的 '子集'，则为 never 否则返回 T
type MyExclude<T, U> = T extends U ? never : T;

//   Exclude<"a" | "b" | "c", "a" | "c">
// = Exclude<"a" , "a" | "c"> | Exclude<"b", "a" | "c"> | Exclude<"c", "a" | "c">
// = never | "b" | never
// = "b"
