describe('Object.assign', () => {
  test('常规用法', () => {
    // 继承属性和不可枚举属性是不能拷贝的
    const obj1 = Object.create({
      foo: 1,
      bar: 2,
    });
    obj1.baz = 1;
    obj1[Symbol.for('hello')] = 333;
    const myFn = () => void 0;
    const obj2 = {
      foo: null,
      bar: undefined,
      fn: myFn,
    };
    const res = Object.assign(obj1, obj2);
    expect(res).toStrictEqual({
      bar: undefined,
      baz: 1,
      foo: null,
      // String 类型和 Symbol 类型的属性都会被拷贝。
      [Symbol.for('hello')]: 333,
      fn: myFn,
    });
  });

  test('assign 时，source 会调用 setter target 会调用 getter 但是 getter、setter 不会被复制', () => {
    const obj1Getter = jest.fn();
    const obj2Getter = jest.fn();
    const obj1Setter = jest.fn();
    const obj2Setter = jest.fn();

    const obj1 = {
      get prop() {
        console.log('obj1 getter called!');
        obj1Getter();
        return 'hello';
      },
      set prop(v) {
        obj1Setter();
        console.log('obj1 setter called!');
      },
    };
    const obj2 = {
      get prop() {
        console.log('obj2 getter called!');
        obj2Getter();
        return 'hello';
      },
      set prop(v) {
        obj2Setter();
        console.log('obj2 setter called!');
      },
    };
    const o3 = Object.assign(obj1, obj2);
    // target 的 setter 会被调用
    expect(obj1Setter).toBeCalled();
    // source 的 getter 会被调用
    expect(obj2Getter).toBeCalled();
    expect(obj1Getter).toBeCalledTimes(0);
    expect(obj2Setter).toBeCalledTimes(0);
    expect(o3).toStrictEqual({
      prop: 'hello',
    });
    // 目标保留了 setter 和 getter
    console.log(o3.prop);
    o3.prop = 12312;
    expect(obj1Getter).toBeCalledTimes(2);
    expect(obj1Setter).toBeCalledTimes(2);
  });
});
