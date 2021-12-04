describe('reduce', () => {
  test('使用 reduce 实现 map', () => {
    Array.prototype.myMap = function (callback) {
      return this.reduce((previousValue, currentValue, currentIndex) => {
        return previousValue.concat([callback(currentValue, currentIndex)]);
      }, []);
    };

    const mapper = [1, 2, 4, 5].myMap((item, index) => {
      return {
        index: index,
        item: item,
      };
    });

    const mapperByMapFn = [1, 2, 4, 5].map((item, index) => {
      return {
        index: index,
        item: item,
      };
    });

    expect(mapper).toStrictEqual(mapperByMapFn);
  });
});
