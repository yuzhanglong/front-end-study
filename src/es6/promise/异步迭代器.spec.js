describe('异步迭代器 demo', function () {
  test('可迭代对象', () => {
    function myIterator(array) {
      let nextIndex = 0;

      return {
        [Symbol.iterator]: () => {
          return {
            next: function () {
              if (nextIndex < array.length) {
                return {
                  value: array[nextIndex++],
                  done: false,
                };
              }
              return {
                done: true,
              };
            },
          };
        },
      };
    }

    const it = myIterator([1, 2, 3, 4]);
    let arr = [];
    for (let itElement of it) {
      arr.push(itElement);
    }
    expect(arr).toStrictEqual([1, 2, 3, 4]);
  });

  test('异步迭代器使用', async () => {
    let myIterator = {
      [Symbol.asyncIterator]: () => {
        let items = [1, 2, 3, 4];
        return {
          next: () =>
            Promise.resolve({
              done: items.length === 0,
              value: items.shift(),
            }),
        };
      },
    };

    let arr = [];
    for await (let itElement of myIterator) {
      arr.push(itElement);
    }
    expect(arr).toStrictEqual([1, 2, 3, 4]);
  });
});
