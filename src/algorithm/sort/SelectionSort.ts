/*
 * File: SelectionSort.ts
 * Description: 选择排序
 * Created: 2020-12-12 21:07:59
 * Author: yuzhanglong
 * Email: yuzl1123@163.com
 */

import Sort from "./Sort";

class SelectionSort<T> extends Sort<T> {
  public runSort(): void {
    for (let i = 0; i < this.array.length; i++) {
      let index = this.findElement(i);
      this.swap(index, i);
    }
  }

  /**
   * 从传入的开始下标寻找，找到一个最小的，并返回
   * 已经排好序数组的区间范围是 [0, index)
   *
   * @param startIndex 开始下标
   * @return 寻找到的最小数字的下标
   */
  private findElement(startIndex: number) {
    let minIndex = startIndex;
    for (let i = startIndex + 1; i < this.array.length; i++) {
      if (this.compare(i, minIndex) < 0) {
        minIndex = i;
      }
    }
    return minIndex;
  }
}

export default SelectionSort;
