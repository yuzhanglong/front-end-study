describe('array some demo', function () {
  test('输入二维数组和一个整数，判断二维数组中是否含有该整数', () => {
    const hasNumberInArray = (arr, number) => {
      return arr.some((a) => a.some((item) => item === number))
    }
    expect(hasNumberInArray([[2, 4, 5], [], [1, 2, 3]], 2)).toBeTruthy()
    expect(hasNumberInArray([[2, 4, 5], [], [1, 2, 3]], 66)).toBeFalsy()
  })
})
