describe('实现 call', function () {
  Function.prototype.myCall = function (targetThis, ...args) {
    let fn = this;

    if (!targetThis) {
      return fn(...args);
    }

    if (typeof targetThis === 'number') {
      targetThis = new Number(targetThis);
    }

    if (typeof targetThis === 'string') {
      targetThis = new String(targetThis);
    }

    const fnKey = Symbol.for('function key');
    targetThis[fnKey] = fn;
    const returnVal = targetThis[fnKey](...args);
    Reflect.deleteProperty(targetThis, fnKey);
    return returnVal;
  };

  test('call should respect `thisArg and args`', () => {
    function hello(...args) {
      expect(this.a).toStrictEqual(1);
      expect(this.b).toStrictEqual(2);
      expect(args).toStrictEqual([1, 2, 3]);
    }

    hello.myCall(
      {
        a: 1,
        b: 2,
      },
      1,
      2,
      3
    );
  });

  test('primitive values 1, `1` should be transformed', () => {
    function returnThis() {
      return this;
    }

    expect(returnThis.myCall(1)).toBeTruthy();
  });
});
