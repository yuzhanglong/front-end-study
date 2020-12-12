/*
 * File: QuickSort.ts
 * Description: 快速排序
 * Created: 2020-12-12 21:17:45
 * Author: yuzhanglong
 * Email: yuzl1123@163.com
 */

import Sort from "./Sort";

class QuickSort<T> extends Sort<T> {
  public runSort(): void {
    this.quickSort(0, this.array.length);
  }

  /**
   * 对 [begin, end) 范围的元素进行快速排序
   *
   * @param begin 起始位置
   * @param end 结束位置
   */
  private quickSort(begin: number, end: number) {
    if (end - begin < 2) {
      return;
    }

    let pivot = this.partition(begin, end);

    this.quickSort(begin, pivot);
    this.quickSort(pivot + 1, end);
  }

  /**
   * 构造 [begin, end) 范围的轴点元素
   *
   * @param begin 起始下标
   * @param end 结束下标（开区间）
   * @return 轴点的下标
   */
  protected partition(begin: number, end: number): number {
    // 以 begin 作为轴点元素
    this.choosePivot(begin, end);
    let pivotElement: T = this.array[begin];
    end--;

    while (begin < end) {
      while (begin < end) {
        // 右边的元素大于轴点元素
        if (this.compareByElement(pivotElement, this.array[end]) < 0) {
          // 右指针左移
          end--;
        } else {
          // 右边的元素小于轴点元素，我们把它放到左边
          this.array[begin++] = this.array[end];
          break;
        }
      }

      while (begin < end) {
        // 左边的元素小于轴点元素
        if (this.compareByElement(pivotElement, this.array[begin]) > 0) {
          // 右指针左移
          begin++;
        } else {
          // 右边的元素小于轴点元素，我们把它放到左边
          this.array[end--] = this.array[begin];
          break;
        }
      }
    }
    this.array[begin] = pivotElement;
    return begin;
  }

  protected choosePivot(begin: number, end: number) {
    return;
  }
}

export default QuickSort;
