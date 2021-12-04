/*
 * File: BinarySearchInsertionSort.ts
 * Description: 利用二分查找优化的插入排序
 * Created: 2020-12-12 21:05:28
 * Author: yuzhanglong
 * Email: yuzl1123@163.com
 */

import Sort from './Sort';

class BinarySearchInsertionSort<T> extends Sort<T> {
  public runSort(): void {
    for (let begin = 1; begin < this.array.length; begin++) {
      this.insert(begin, this.findElementByByBinarySearch(begin));
    }
  }

  /**
   * 向排序后的列表中插入一个元素
   *
   * @param source 源数据，即将要执行插入的元素
   * @param target 目标插入位置，在这个位置之后的元素全部右移
   */
  private insert(source: number, target: number) {
    let elementToBeInserted: T = this.array[source];
    for (let i = source; i > target; i--) {
      this.array[i] = this.array[i - 1];
    }
    this.array[target] = elementToBeInserted;
  }

  /**
   * 利用二分搜索找到 index 位置元素的待插入位置
   * 已经排好序数组的区间范围是 [0, index)
   *
   * @param startIndex 开始下标
   * @return 寻找到的最小数字的下标
   */
  private findElementByByBinarySearch(startIndex: number): number {
    let start = 0;
    let end = startIndex;
    while (start < end) {
      let mid = (start + end) >>> 1;
      //
      if (this.compare(startIndex, mid) < 0) {
        end = mid;
      } else {
        start = mid + 1;
      }
    }
    return start;
  }
}

export default BinarySearchInsertionSort;
