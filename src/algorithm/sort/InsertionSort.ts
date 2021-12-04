/*
 * File: InsertionSort.ts
 * Description: 插入排序
 * Created: 2020-12-12 21:01:26
 * Author: yuzhanglong
 * Email: yuzl1123@163.com
 */

import Sort from './Sort';

class InsertionSort<T> extends Sort<T> {
  public runSort(): void {
    for (let begin = 1; begin < this.array.length; begin++) {
      // 拿到当前元素
      let currentElementIndex = begin;
      // 在 currentElementIndex 之前的元素都是已经排好序的，倒着逐一比较即可
      while (
        currentElementIndex >= 1 &&
        this.compare(currentElementIndex, currentElementIndex - 1) < 0
      ) {
        this.swap(currentElementIndex, currentElementIndex - 1);
        currentElementIndex--;
      }
    }
  }
}

export default InsertionSort;
