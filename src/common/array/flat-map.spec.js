describe('flat map', function () {
  test('flat map 用法', () => {
    // flatMap 的一个用法是在 map 的过程中删除某一项
    let arr = [1, -3, 3, 4, -2];
    let res = arr.flatMap((item) => {
      if (item < 0) {
        return [];
      }
      return item;
    });
    expect(res).toStrictEqual([1, 3, 4]);
  });
});
