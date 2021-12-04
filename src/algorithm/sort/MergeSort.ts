/*
 * File: MergeSort.ts
 * Description: 归并排序
 * Created: 2020-12-12 21:26:54
 * Author: yuzhanglong
 * Email: yuzl1123@163.com
 */

import Sort from './Sort';

class MergeSort<T> extends Sort<T> {
  public runSort(): void {
    this.sortByIndexRange(0, this.array.length);
  }

  /**
   * 对 [begin, end) 范围的数据进行归并排序
   *
   * @param begin 起始位置
   * @param end 结束位置（不包含）
   *
   */
  public sortByIndexRange(begin: number, end: number) {
    // 区间内只有1个元素，已经划分到最小了，结束递归
    if (end - begin < 2) {
      return;
    }

    // 中间元素
    let mid = (begin + end) >> 1;

    // 对 [begin, mid) 范围的数据进行归并排序
    this.sortByIndexRange(begin, mid);

    // 对 [mid, end) 范围的数据进行归并排序
    this.sortByIndexRange(mid, end);

    this.merge(begin, mid, end);
  }

  /**
   * 将 [begin, mid) 和 [mid, end) 范围的序列合并成一个有序序列
   *
   * @param begin 起始位置
   * @param mid 中间位置
   * @param end 末位置
   */
  private merge(begin: number, mid: number, end: number) {
    let tmp: T[] = [];
    let leftIndex = begin;
    let rightIndex = mid;

    while (leftIndex < mid && rightIndex < end) {
      tmp.push(
        this.compare(leftIndex, rightIndex) > 0
          ? this.array[rightIndex++]
          : this.array[leftIndex++]
      );
    }
    while (leftIndex < mid) {
      tmp.push(this.array[leftIndex++]);
    }
    while (rightIndex < end) {
      tmp.push(this.array[rightIndex++]);
    }

    for (let i = begin; i < end; i++) {
      this.array[i] = tmp.shift();
    }
  }
}

export default MergeSort;
