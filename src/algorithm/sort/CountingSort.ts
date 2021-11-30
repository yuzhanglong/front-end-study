/*
 * File: CountingSort.ts
 * Description: 计数排序
 * Created: 2020-12-12 21:16:18
 * Author: yuzhanglong
 * Email: yuzl1123@163.com
 */

import Sort from './Sort'

class CountingSort extends Sort<number> {
  // 计数排序只可以处理数字
  public runSort(): void {
    let posCountArray = []
    let negCountArray = []
    this.array.forEach((res) => {
      if (res >= 0) {
        posCountArray[res] >= 1
          ? posCountArray[res]++
          : (posCountArray[res] = 1)
      } else {
        let index = res * -1
        negCountArray[index] >= 1
          ? negCountArray[index]++
          : (negCountArray[index] = 1)
      }
    })

    this.array = []
    for (let i = negCountArray.length; i > 0; i--) {
      if (negCountArray[i] > 0) {
        let cnt = negCountArray[i]
        while (cnt--) {
          this.array.push(i * -1)
        }
      }
    }

    for (let i = 0; i < posCountArray.length; i++) {
      if (posCountArray[i] > 0) {
        let cnt = posCountArray[i]
        while (cnt--) {
          this.array.push(i)
        }
      }
    }
  }
}

export default CountingSort
