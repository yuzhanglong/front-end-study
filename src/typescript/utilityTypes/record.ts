// Record<Keys,Type> 构造具有一组类型为 Type 的属性的键的类型。
// 该实用程序可用于将一个类型的属性映射到另一个类型上。

interface Word {
  chinese: string;
  startWith: string;
}

type TotalWords = "age" | "hobby";

let user: Record<TotalWords, Word> = {
  age: {
    chinese: "年龄",
    startWith: "a"
  },
  hobby: {
    chinese: "爱好",
    startWith: "h"
  }
}

// Record 的实现：
type MyRecord<K extends keyof any, T> = {
  [P in K]: T;
};

// K 表示要映射到 K 上，T 表示被映射上的内容。
// 那么新对象的 value 必须是 T（在上面为 Word）

// P in K 表示新对象的所有 key 为 联合类型 K 的每一个元素
