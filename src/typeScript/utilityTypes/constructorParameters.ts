// ConstructorParameters<Type>
// 从构造函数类型的类型构造元组或数组类型。
// 它会生成具有所有参数类型的元组类型

// 下面举一个构造函数类型的例子，常用于构造工厂函数：

interface Point {
  x: number;
  y: number;
}

interface PointConstructor {
  new (x: number, y: number): Point;
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

type T0 = ConstructorParameters<PointConstructor>;

// [number, number]

let a: T0 = [1, 2];

// 原理
type MyConstructorParameters<T extends new (...args: any) => any> =
  T extends new (...args: infer P) => any ? P : never;

// 如果 T 是 new (...args: infer P) 的子集，返回 infer P 也就是待推断的函数参数

type MyParam<T> = T extends (...args: infer P) => any ? P : never;

type T1 = MyParam<number>; // T1 为 never
type T2 = MyParam<(a: string) => void>; // T2 为 [string]
