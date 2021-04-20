// OmitThisParameter<Type>
// 从“类型”中删除 this 参数。
// 如果Type没有显式声明此参数，则结果就是Type。
// 否则，将从Type中创建一个没有此参数的新函数类型。
// 泛型将被擦除，只有最后的重载签名才会传播到新的函数类型中。

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
unsafeAddX(10); // 用来在编译阶段保护函数作用上下文正确性的 this 参数被删除


// 原理
type MyOmitThisParameter<T>
  = unknown extends ThisParameterType<T> ?
  T : T extends (...args: infer A) => infer R ?
    (...args: A) => R : T;

// 如果没有显式声明 this, 那么 ThisParameterType<T> 会返回 unknown，则结果就是Type。
// 如果声明了 this，则 ThisParameterType<T> 会获取到 this 的类型
// 后面的内容表示 如果 T 是一个函数，则创建创建一个没有 this 的新函数类型，否则返回 T
