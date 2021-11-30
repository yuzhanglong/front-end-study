import { combinationSum } from '../回溯-加起来和为目标值的组合'
import {
  binarySearch,
  lowerBound,
  searchInRotatedSortedArray,
} from '../二分查找'

describe('test 回溯-加起来和为目标值的组合', () => {
  test('test 测试样例1', () => {
    let res = combinationSum([100, 10, 20, 70, 60, 10, 50], 80)
    expect(res).toStrictEqual([
      [10, 10, 60],
      [10, 20, 50],
      [10, 70],
      [20, 60],
    ])
  })

  test('test 测试样例2', () => {
    let res = combinationSum([100, 10, 20], 30)
    expect(res).toStrictEqual([[10, 20]])
  })
})

describe('test 二分查找模板 -- 数组中第一个大于等于查找值的位置', () => {
  test('test 刚好相等', () => {
    let res = lowerBound(4, [1, 2, 4, 4, 5])
    expect(res).toStrictEqual(3)
  })

  test('test 大于某个值', () => {
    let res = lowerBound(3, [1, 2, 4, 4, 5])
    expect(res).toStrictEqual(3)
  })

  test('test 查找失败', () => {
    let res = lowerBound(10, [1, 2, 4, 4, 5])
    expect(res).toStrictEqual(6)
  })
})

describe('test 二分查找模板 -- 搜索旋转数组', () => {
  test('test 二分查找函数', () => {
    let res = binarySearch([1, 2, 4, 4, 5], 0, 5, 2)
    expect(res).toStrictEqual(1)
  })

  test('test 有序数组', () => {
    let res = searchInRotatedSortedArray([1, 2, 4, 4, 5], 2)
    expect(res).toStrictEqual(1)
  })

  test('test2 有序数组', () => {
    let res = searchInRotatedSortedArray([1, 2, 3, 4, 8], 8)
    expect(res).toStrictEqual(4)
  })

  test('test3 有序数组', () => {
    let res = searchInRotatedSortedArray([1, 3], 1)
    expect(res).toStrictEqual(0)
  })

  test('test 旋转数组', () => {
    let res = searchInRotatedSortedArray([4, 5, 6, 7, 0, 1, 2], 0)
    expect(res).toStrictEqual(4)
  })

  test('test 查找失败', () => {
    let res = searchInRotatedSortedArray([4, 5, 6, 7, 0, 1, 2], 3)
    expect(res).toStrictEqual(-1)
  })
})
