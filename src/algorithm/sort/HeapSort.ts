/*
 * File: HeapSort.ts
 * Description: 堆排序（HeapSort）
 * Created: 2020-12-12 20:51:48
 * Author: yuzhanglong
 * Email: yuzl1123@163.com
 */

import Sort from './Sort'

class HeapSort<T> extends Sort<T> {
  private heapSize

  public runSort(): void {
    this.heapSize = this.array.length
    let lastParent = (this.heapSize >> 1) - 1
    // 遍历每一个可能有孩子的节点进行建堆
    for (let i = lastParent; i >= 0; i--) {
      this.heapify(i, this.heapSize - 1)
    }

    // 每次将最大的父亲节点放到底部，然后将最后一个元素放到堆顶
    // 注意，放到底部的父亲节点被移出堆了，所以我们在 heapify 时的结束坐标需要减一
    for (let i = this.heapSize - 1; i > 0; i--) {
      this.swap(0, i)
      this.heapify(0, i - 1)
    }
  }

  /**
   * 堆的调整，将堆的末端子节点作调整，使得子节点永远小于父节点
   *
   * @param start 开始坐标，即父亲节点
   * @param end 结束坐标
   */
  public heapify(start: number, end: number) {
    // 拿到父亲节点
    let dad = start
    // 左孩子节点
    let son = (dad << 1) + 1
    // 当下标大于堆的最大值时，跳出循环
    while (son <= end) {
      // 右侧子节点下标合法，并且右侧节点大于左侧节点
      if (son + 1 <= end && this.compare(son, son + 1) < 0) {
        // 准备和右孩子交换
        son++
      }
      // 如果父节点比任何一个子节点都大，则我们不处理
      if (this.compare(dad, son) > 0) {
        return
      } else {
        // 交换父亲和选出来的最大的孩子
        this.swap(dad, son)
        // 让新的孩子成为父亲，为接下来的调整做准备
        dad = son
        // 孩子的孩子
        son = (dad << 1) + 1
      }
    }
  }
}

export default HeapSort
