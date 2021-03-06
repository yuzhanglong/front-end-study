/*
 * File: sort.spec.ts
 * Description: 排序单元测试
 * Created: 2020-12-12 20:38:30
 * Author: yuzhanglong
 * Email: yuzl1123@163.com
 */
import BubbleSort from '../BubbleSort'
import SelectionSort from '../SelectionSort'
import InsertionSort from '../InsertionSort'
import BinarySearchInsertionSort from '../BinarySearchInsertionSort'
import MergeSort from '../MergeSort'
import QuickSort from '../QuickSort'
import RandomQuickSort from '../RandomQuickSort'
import CountingSort from '../CountingSort'
import HeapSort from '../HeapSort'
import ShellSort from '../ShellSort'

const TEST_ARRAY = [3, 44, 38.45, 5, -47, 15, -36, 26.71, 27, 2, -46, 4, 19, 50, 48]
const EXPECTED_SORTED_ARRAY = [-47, -46, -36, 2, 3, 4, 5, 15, 19, 26.71, 27, 38.45, 44, 48, 50]


describe('test bubble sort', () => {
  test('test number array', () => {
    let arr = TEST_ARRAY.slice()
    let sort = new BubbleSort<number>()
    sort.sort(arr)
    expect(sort.getArray()).toStrictEqual(EXPECTED_SORTED_ARRAY)
  })
})

describe('test selection sort', () => {
  test('test number array', () => {
    let arr = TEST_ARRAY.slice()
    let sort = new SelectionSort<number>()
    sort.sort(arr)
    expect(sort.getArray()).toStrictEqual(EXPECTED_SORTED_ARRAY)
  })
})

describe('test insertion sort', () => {
  test('test number array', () => {
    let arr = TEST_ARRAY.slice()
    let sort = new InsertionSort<number>()
    sort.sort(arr)
    expect(sort.getArray()).toStrictEqual(EXPECTED_SORTED_ARRAY)
  })

  test('test by binary search', () => {
    let arr = TEST_ARRAY.slice()
    let sort = new BinarySearchInsertionSort<number>()
    sort.sort(arr)
    expect(sort.getArray()).toStrictEqual(EXPECTED_SORTED_ARRAY)
  })
})

describe('test merge sort', () => {
  test('test number array', () => {
    let arr = TEST_ARRAY.slice()
    let sort = new MergeSort<number>()
    sort.sort(arr)
    expect(sort.getArray()).toStrictEqual(EXPECTED_SORTED_ARRAY)
  })
})

describe('test quick sort', () => {
  test('test number array', () => {
    let arr = TEST_ARRAY.slice()
    let sort = new QuickSort<number>()
    sort.sort(arr)
    expect(sort.getArray()).toStrictEqual(EXPECTED_SORTED_ARRAY)
  })

  test('test random quick sort', () => {
    let arr = TEST_ARRAY.slice()
    let sort = new RandomQuickSort<number>()
    sort.sort(arr)
    expect(sort.getArray()).toStrictEqual(EXPECTED_SORTED_ARRAY)
  })
})


describe('test counting sort', () => {
  test('test number array', () => {
    let arr = [3, 44, 38, -47, 15, -36, 26, 27, 2, -46, 4, 19, 50, 48, 5]
    const expected = [-47, -46, -36, 2, 3, 4, 5, 15, 19, 26, 27, 38, 44, 48, 50]
    let sort = new CountingSort()
    sort.sort(arr)
    expect(sort.getArray()).toStrictEqual(expected)
  })
})


describe('test heap sort', () => {
  test('test number array', () => {
    let arr = TEST_ARRAY.slice()
    let sort = new HeapSort<number>()
    sort.sort(arr)
    expect(sort.getArray()).toStrictEqual(EXPECTED_SORTED_ARRAY)
  })
})

describe('test shell sort', () => {
  test('test number array', () => {
    let arr = TEST_ARRAY.slice()
    let sort = new ShellSort<number>()
    sort.sort(arr)
    expect(sort.getArray()).toStrictEqual(EXPECTED_SORTED_ARRAY)
  })
})
