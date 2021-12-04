// Extract<Type, Union>
// 通过从Type中提取可分配给Union的所有Union成员来构造类型。

type T0 = Extract<'a' | 'b' | 'c', 'a' | 'f'>;

// Extract 原理，它其实和 exclude 的情况相反
// 拿 T0 来说，
// T0 = Extract<"a" | "b" | "c", "a" | "f">
//    = Extract<"a" , "a" | "f"> | <"b" , "a" | "f"> | <"c" , "a" | "f">
//    = "a"

type MyExtract<T, U> = T extends U ? T : never;
