/*
 * File: RandomQuickSort.ts
 * Description: 快速排序（随机轴点）
 * Created: 2020-12-12 21:23:03
 * Author: yuzhanglong
 * Email: yuzl1123@163.com
 */

import QuickSort from './QuickSort'

class RandomQuickSort<T> extends QuickSort<T> {
  protected choosePivot(begin: number, end: number) {
    let randomIndexAddition = parseInt(String(Math.random() * (end - begin)))
    this.swap(begin, begin + randomIndexAddition)
  }
}

export default RandomQuickSort
