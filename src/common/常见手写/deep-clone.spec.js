describe('实现深拷贝', function () {
  test('deep clone', () => {
    function deepCopy(obj) {
      let tmp = {};
      for (let objKey in obj) {
        if (Object.hasOwnProperty.call(obj, objKey)) {
          const val = obj[objKey];
          if (Array.isArray(val)) {
            tmp = [];
            for (let i = 0; i < val.length; i++) {
              tmp[i] = deepCopy(val);
            }
          } else if (typeof val === 'object') {
            tmp[objKey] = deepCopy(val);
          } else {
            tmp[objKey] = val;
          }
        }
      }
      return tmp;
    }

    const val = { a: 1, b: 2, c: 3 };
    expect(deepCopy(val)).toStrictEqual({ a: 1, b: 2, c: 3 });
    expect(deepCopy(val) === val).toBeFalsy();
  });
});
