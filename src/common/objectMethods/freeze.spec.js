describe('Object.freeze', function () {
  test('冻结一个对象。一个被冻结的对象再也不能被修改', () => {
    const obj = {
      prop: 42,
    };

    const obj2 = Object.create(obj);

    obj2.prop2 = 42;

    Object.freeze(obj2);

    obj2.prop = 666;
    // Throws an error in strict mode
    obj2.prop2 = 666;

    expect(obj2.prop).toStrictEqual(42);
    expect(obj2.prop2).toStrictEqual(42);
    // expected output: 42
  });

  test('无法更改原型', () => {
    const obj = {
      prop: 42,
    };
    Object.freeze(obj);
    // // 会报错！！
    // Object.setPrototypeOf(obj, { x: 20 })
    // obj.__proto__ = { x: 20 }
  });

  test('冻结是一种浅冻结', () => {
    let obj1 = {
      internal: {},
    };

    Object.freeze(obj1);
    obj1.internal.a = 'aValue';

    expect(obj1.internal.a).toStrictEqual('aValue');
  });
});
