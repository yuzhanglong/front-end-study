/*
 * File: Sort.ts
 * Description: 排序算法基础类
 * Created: 2020-12-12 20:27:34
 * Author: yuzhanglong
 * Email: yuzl1123@163.com
 */

import { Comparator } from '../common/public'

abstract class Sort<T> {
  protected array: T[]

  protected comparator: Comparator<T>

  public sort(array: T[], comparator: Comparator<T> = undefined): void {
    this.array = array
    // 数组为空
    if (this.array == null) {
      return
    }
    // 长度为 1 or 0 的数组，返回
    if (this.array.length < 2) {
      return
    }

    this.comparator = comparator

    // 执行排序
    this.runSort()
  }

  public abstract runSort(): void

  protected compare(index1: number, index2: number): number {
    if (
      this.isArrayIndexOutOfBounds(index1) ||
      this.isArrayIndexOutOfBounds(index2)
    ) {
      throw new Error('数组下标越界')
    }
    let el1: T = this.array[index1]
    let el2: T = this.array[index2]
    return this.compareByElement(el1, el2)
  }

  protected compareByElement(el1: T, el2: T) {
    if (!this.isComparatorAccepted()) {
      if (typeof el1 === 'number' && typeof el2 === 'number') {
        return el1 - el2
      } else {
        throw new Error('非数值类型请传入比较器函数')
      }
    } else {
      return this.comparator(el1, el2)
    }
  }

  protected swap(index1: number, index2: number) {
    let tmp: T = this.array[index1]
    this.array[index1] = this.array[index2]
    this.array[index2] = tmp
  }

  private isComparatorAccepted(): boolean {
    return (
      this.comparator !== undefined &&
      this.comparator !== null &&
      typeof this.comparator === 'function'
    )
  }

  public getArray(): T[] {
    return this.array
  }

  private isArrayIndexOutOfBounds(index: number): boolean {
    return index >= this.array.length || index < 0
  }
}

export default Sort
