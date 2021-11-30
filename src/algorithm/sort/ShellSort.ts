/*
 * File: ShellSort.ts
 * Description: 希尔排序（Shell Sort）
 * Created: 2020-12-12 21:00:52
 * Author: yuzhanglong
 * Email: yuzl1123@163.com
 */

import Sort from './Sort'

class ShellSort<T> extends Sort<T> {
  public runSort(): void {
    // 初始化 gap 为 length / 2 并逐步缩小
    for (let gap = this.array.length >> 1; gap > 0; gap >>= 1) {
      // 从第 gap个元素开始执行插入排序
      for (let i = gap; i < this.array.length; i++) {
        let currentElement = i
        // 如果第 currentElement 个元素比第 currentElement - gap 个元素小，则交换
        while (
          currentElement - gap >= 0 &&
          this.compare(currentElement, currentElement - gap) < 0
        ) {
          this.swap(currentElement, currentElement - gap)
          currentElement -= gap
        }
      }
    }
  }
}

export default ShellSort
