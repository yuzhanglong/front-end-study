interface User {
  name: string;
  age: number;
}

interface SetUser {
  (name: string, age: number): void;
}

type User2 = {
  name: string;
  age: number;
};

type SetUser2 = (name: string, age: number) => void;

// 当你想获取一个变量的类型时，使用 typeof
let div = document.createElement('div');
type B = typeof div;

// never 类型收窄
let a: never;

// a = '1213'
