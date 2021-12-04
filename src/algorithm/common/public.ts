interface BaseNode<E> {
  element: E;
  left: BaseNode<E>;
  right: BaseNode<E>;
}

// 用来自定义比较的 `comparator` 函数
type Comparator<T> = ((object1: T, object2: T) => number) | undefined;

export { BaseNode, Comparator };
