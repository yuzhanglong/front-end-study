/*
 * File: BubbleSort.ts
 * Description: 冒泡排序
 * Created: 2020-12-12 21:14:10
 * Author: yuzhanglong
 * Email: yuzl1123@163.com
 */

import Sort from './Sort';

class BubbleSort<T> extends Sort<T> {
  public runSort(): void {
    for (let i = 0; i < this.array.length - 1; i++) {
      for (let j = 0; j < this.array.length - i - 1; j++) {
        if (this.compare(j, j + 1) > 0) {
          this.swap(j, j + 1);
        }
      }
    }
  }
}

export default BubbleSort;
