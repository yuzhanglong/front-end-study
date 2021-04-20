// ThisParameterType<Type>
// 提取函数类型的this参数的类型，
// 如果函数类型没有this参数，
// 则提取此参数的类型。


// 首先介绍一下这个 this 参数怎么用，它是用来防止函数在不适合调用的上下文调用
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


// 同样利用了 infer ，这里是推断 this 的类型，不再赘述

type MyThisParameterType<T> = T extends (this: infer U, ...args: any[]) => any ? U : unknown;
