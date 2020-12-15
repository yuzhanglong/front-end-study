# typescript 数据结构与算法

[[toc]]

## 经典排序算法

### 代码结构约定与规范

- 所有排序类均继承自基础类 `Sort`，基础类可传入排序元素泛型

- 排序时可选传入用来自定义比较的 `comparator` 函数

- 子类通过实现 `runSort()` 抽象方法来实现排序

- 基础类应该具有以下公共方法：
    - `compare(index1: number, index2: number)` 传入两个下标，进行比较，如果前者大于后者则返回正值

    - `swap(index1: number, index2: number)` 交换相应下标的两个元素

- 使用 `Jest` 进行测试。

基础类代码如下：

```typescript
/*
 * File: Sort.ts
 * Description: 排序算法基础类
 * Created: 2020-12-12 20:27:34
 * Author: yuzhanglong
 * Email: yuzl1123@163.com
 */

// 用来自定义比较的 `comparator` 函数
export type Comparator<T> = ((object1: T, object2: T) => number) | undefined;

abstract class Sort<T> {
  protected array: T[];

  protected comparator: Comparator<T>;

  public sort(array: T[], comparator: Comparator<T> = undefined): void {
    this.array = array;
    // 数组为空
    if (this.array == null) {
      return;
    }
    // 长度为 1 or 0 的数组，返回
    if (this.array.length < 2) {
      return;
    }

    this.comparator = comparator;

    // 执行排序
    this.runSort();
  }

  public abstract runSort(): void;

  protected compare(index1: number, index2: number): number {
    if (this.isArrayIndexOutOfBounds(index1) || this.isArrayIndexOutOfBounds(index2)) {
      throw new Error("数组下标越界");
    }
    let el1: T = this.array[index1];
    let el2: T = this.array[index2];
    return this.compareByElement(el1, el2);
  }

  protected compareByElement(el1: T, el2: T) {
    if (!this.isComparatorAccepted()) {
      if (typeof el1 === "number" && typeof el2 === "number") {
        return el1 - el2;
      } else {
        throw new Error("非数值类型请传入比较器函数");
      }
    } else {
      return this.comparator(el1, el2);
    }
  }

  protected swap(index1: number, index2: number) {
    let tmp: T = this.array[index1];
    this.array[index1] = this.array[index2];
    this.array[index2] = tmp;
  }

  private isComparatorAccepted(): boolean {
    return this.comparator !== undefined && this.comparator !== null && typeof this.comparator === "function";
  }

  public getArray(): T[] {
    return this.array;
  }

  private isArrayIndexOutOfBounds(index: number): boolean {
    return index >= this.array.length || index < 0;
  }
}

export default Sort;
```

测试代码如下：

```typescript
/*
 * File: sort.spec.ts
 * Description: 排序单元测试
 * Created: 2020-12-12 20:38:30
 * Author: yuzhanglong
 * Email: yuzl1123@163.com
 */
import BubbleSort from "../BubbleSort";
import SelectionSort from "../SelectionSort";
import InsertionSort from "../InsertionSort";
import BinarySearchInsertionSort from "../BinarySearchInsertionSort";
import MergeSort from "../MergeSort";
import QuickSort from "../QuickSort";
import RandomQuickSort from "../RandomQuickSort";
import CountingSort from "../CountingSort";
import HeapSort from "../HeapSort";
import ShellSort from "../ShellSort";

const TEST_ARRAY = [3, 44, 38.45, 5, -47, 15, -36, 26.71, 27, 2, -46, 4, 19, 50, 48];
const EXPECTED_SORTED_ARRAY = [-47, -46, -36, 2, 3, 4, 5, 15, 19, 26.71, 27, 38.45, 44, 48, 50];


describe('test bubble sort', () => {

  test('test number array', () => {
    let arr = TEST_ARRAY.slice();
    let sort = new BubbleSort<number>();
    sort.sort(arr);
    expect(sort.getArray()).toStrictEqual(EXPECTED_SORTED_ARRAY);
  });
});

describe('test selection sort', () => {
  test('test number array', () => {
    let arr = TEST_ARRAY.slice();
    let sort = new SelectionSort<number>();
    sort.sort(arr);
    expect(sort.getArray()).toStrictEqual(EXPECTED_SORTED_ARRAY);
  });
});

describe('test insertion sort', () => {
  test('test number array', () => {
    let arr = TEST_ARRAY.slice();
    let sort = new InsertionSort<number>();
    sort.sort(arr);
    expect(sort.getArray()).toStrictEqual(EXPECTED_SORTED_ARRAY);
  });

  test('test by binary search', () => {
    let arr = TEST_ARRAY.slice();
    let sort = new BinarySearchInsertionSort<number>();
    sort.sort(arr);
    expect(sort.getArray()).toStrictEqual(EXPECTED_SORTED_ARRAY);
  });
});

describe('test merge sort', () => {
  test('test number array', () => {
    let arr = TEST_ARRAY.slice();
    let sort = new MergeSort<number>();
    sort.sort(arr);
    expect(sort.getArray()).toStrictEqual(EXPECTED_SORTED_ARRAY);
  });
});

describe('test quick sort', () => {
  test('test number array', () => {
    let arr = TEST_ARRAY.slice();
    let sort = new QuickSort<number>();
    sort.sort(arr);
    expect(sort.getArray()).toStrictEqual(EXPECTED_SORTED_ARRAY);
  });

  test('test random quick sort', () => {
    let arr = TEST_ARRAY.slice();
    let sort = new RandomQuickSort<number>();
    sort.sort(arr);
    expect(sort.getArray()).toStrictEqual(EXPECTED_SORTED_ARRAY);
  });
});


describe('test counting sort', () => {
  test('test number array', () => {
    let arr = [3, 44, 38, -47, 15, -36, 26, 27, 2, -46, 4, 19, 50, 48, 5];
    const expected = [-47, -46, -36, 2, 3, 4, 5, 15, 19, 26, 27, 38, 44, 48, 50];
    let sort = new CountingSort();
    sort.sort(arr);
    expect(sort.getArray()).toStrictEqual(expected);
  });
});


describe('test heap sort', () => {
  test('test number array', () => {
    let arr = TEST_ARRAY.slice();
    let sort = new HeapSort<number>();
    sort.sort(arr);
    expect(sort.getArray()).toStrictEqual(EXPECTED_SORTED_ARRAY);
  });
});

describe('test shell sort', () => {
  test('test number array', () => {
    let arr = TEST_ARRAY.slice();
    let sort = new ShellSort<number>();
    sort.sort(arr);
    expect(sort.getArray()).toStrictEqual(EXPECTED_SORTED_ARRAY);
  });
});
```

测试结果如下：

![](http://cdn.yuzzl.top/blog/20201212213134.png)

### 堆排序（Heap Sort）

堆排序是利用堆这种数据结构所设计的一种排序算法。

堆是一个近似完全二叉树的结构，并同时满足堆的性质：即子节点的键值或索引总是小于（或者大于）它的父节点。

堆排序的基本思路：

- 为初始数组原地建堆（这里以建立成最大堆为例）
- 每次从数组中取出最大的节点（在堆顶），和最后一个节点交换，并调整最大堆（注意此时新堆的长度要减一）

```typescript
/*
 * File: HeapSort.ts
 * Description: 堆排序（HeapSort）
 * Created: 2020-12-12 20:51:48
 * Author: yuzhanglong
 * Email: yuzl1123@163.com
 */

import Sort from "./Sort";

class HeapSort<T> extends Sort<T> {
  private heapSize;

  public runSort(): void {
    this.heapSize = this.array.length;
    let lastParent = (this.heapSize >> 1) - 1;
    // 遍历每一个可能有孩子的节点进行建堆
    for (let i = lastParent; i >= 0; i--) {
      this.heapify(i, this.heapSize - 1);
    }

    // 每次将最大的父亲节点放到底部，然后将最后一个元素放到堆顶
    // 注意，放到底部的父亲节点被移出堆了，所以我们在 heapify 时的结束坐标需要减一
    for (let i = this.heapSize - 1; i > 0; i--) {
      this.swap(0, i);
      this.heapify(0, i - 1);
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
    let dad = start;
    // 左孩子节点
    let son = (dad << 1) + 1;
    // 当下标大于堆的最大值时，跳出循环
    while (son <= end) {
      // 右侧子节点下标合法，并且右侧节点大于左侧节点
      if (son + 1 <= end && this.compare(son, son + 1) < 0) {
        // 准备和右孩子交换
        son++;
      }
      // 如果父节点比任何一个子节点都大，则我们不处理
      if (this.compare(dad, son) > 0) {
        return;
      } else {
        // 交换父亲和选出来的最大的孩子
        this.swap(dad, son);
        // 让新的孩子成为父亲，为接下来的调整做准备
        dad = son;
        // 孩子的孩子
        son = (dad << 1) + 1;
      }
    }
  }
}

export default HeapSort;
```

### 希尔排序（Shell Sort）

希尔排序，也称递减增量排序算法，是插入排序的一种更高效的改进版本。希尔排序是非稳定排序算法。

希尔排序是基于插入排序的以下两点性质而提出改进方法的：

插入排序在对几乎已经排好序的数据操作时，效率高，即可以达到线性排序的效率

但插入排序一般来说是低效的，因为插入排序每次只能将数据移动一位。

希尔排序的基本思路：

- 初始化步长为**排序数组长度 / 2**
- 将数组**对列排序**（插入排序），其中列数即为步长，来看下面这个例子，它表示**以步长为5来对列排序**。

排序前：

```
13 14 94 33 82
25 59 94 65 23
45 27 73 25 39
10
```

排序后：

```
10 14 73 25 23
13 27 94 33 39
25 59 94 65 82
45
```

代码实现：

```typescript
/*
 * File: ShellSort.ts
 * Description: 希尔排序（Shell Sort）
 * Created: 2020-12-12 21:00:52
 * Author: yuzhanglong
 * Email: yuzl1123@163.com
 */

import Sort from "./Sort";

class ShellSort<T> extends Sort<T> {
  public runSort(): void {
    // 初始化 gap 为 length / 2 并逐步缩小
    for (let gap = this.array.length >> 1; gap > 0; gap >>= 1) {
      // 从第 gap个元素开始执行插入排序
      for (let i = gap; i < this.array.length; i++) {

        let currentElement = i;
        // 如果第 currentElement 个元素比第 currentElement - gap 个元素小，则交换
        while (currentElement - gap >= 0 && (this.compare(currentElement, currentElement - gap) < 0)) {
          this.swap(currentElement, currentElement - gap);
          currentElement -= gap;
        }
      }
    }
  }
}

export default ShellSort;
```

### 插入排序（Insertion Sort）

它的工作原理是通过构建有序序列，对于未排序数据，在已排序序列中从后向前扫描，找到相应位置并插入。

```typescript
/*
 * File: InsertionSort.ts
 * Description: 插入排序
 * Created: 2020-12-12 21:01:26
 * Author: yuzhanglong
 * Email: yuzl1123@163.com
 */

import Sort from "./Sort";

class InsertionSort<T> extends Sort<T> {
  public runSort(): void {
    for (let begin = 1; begin < this.array.length; begin++) {
      // 拿到当前元素
      let currentElementIndex = begin;
      // 在 currentElementIndex 之前的元素都是已经排好序的，倒着逐一比较即可
      while (currentElementIndex >= 1 && this.compare(currentElementIndex, currentElementIndex - 1) < 0) {
        this.swap(currentElementIndex, currentElementIndex - 1);
        currentElementIndex--;
      }
    }
  }
}

export default InsertionSort;
```

看到**有序序列**我们就可以使用二分查找进行优化：

```typescript
/*
 * File: BinarySearchInsertionSort.ts
 * Description: 利用二分查找优化的插入排序
 * Created: 2020-12-12 21:05:28
 * Author: yuzhanglong
 * Email: yuzl1123@163.com
 */

import Sort from "./Sort";

class BinarySearchInsertionSort<T> extends Sort<T> {
  public runSort(): void {
    for (let begin = 1; begin < this.array.length; begin++) {
      this.insert(begin, this.findElementByByBinarySearch(begin));
    }
  }

  /**
   * 向排序后的列表中插入一个元素
   *
   * @param source 源数据，即将要执行插入的元素
   * @param target 目标插入位置，在这个位置之后的元素全部右移
   */
  private insert(source: number, target: number) {
    let elementToBeInserted: T = this.array[source];
    for (let i = source; i > target; i--) {
      this.array[i] = this.array[i - 1];
    }
    this.array[target] = elementToBeInserted;
  }

  /**
   * 利用二分搜索找到 index 位置元素的待插入位置
   * 已经排好序数组的区间范围是 [0, index)
   *
   * @param startIndex 开始下标
   * @return 寻找到的最小数字的下标
   */
  private findElementByByBinarySearch(startIndex: number): number {
    let start = 0;
    let end = startIndex;
    while (start < end) {
      let mid = (start + end) >>> 1;
      //
      if (this.compare(startIndex, mid) < 0) {
        end = mid;
      } else {
        start = mid + 1;
      }
    }
    return start;
  }
}

export default BinarySearchInsertionSort;
```

### 归并排序（Merge Sort）

归并排序采用分治法，主要分为两部分：

分割：递归地把当前序列平均分割成两半。 集成：在保持元素顺序的同时将上一步得到的子序列集成到一起（归并）。

```typescript
/*
 * File: MergeSort.ts
 * Description: 归并排序
 * Created: 2020-12-12 21:26:54
 * Author: yuzhanglong
 * Email: yuzl1123@163.com
 */


import Sort from "./Sort";

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
      tmp.push((this.compare(leftIndex, rightIndex) > 0) ? this.array[rightIndex++] : this.array[leftIndex++]);
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
```

### 快速排序（Quick Sort）

快速排序通过选择轴点元素，将轴点元素移动到正确的位置（这个位置的特点是左边的元素比轴点元素小，右边的比它大）。

接着使用分治法策略来把这个数组以轴点为界，分为较小和较大的2个子序列，然后递归地排序两个子序列。

选取基准值有数种具体方法，此选取方法对排序的时间性能有决定性影响。

下面的代码通过选择第一个元素为轴点进行排序：

```typescript
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
```

下面的代码通过随机选取轴点排序：

```typescript
/*
 * File: RandomQuickSort.ts
 * Description: 快速排序（随机轴点）
 * Created: 2020-12-12 21:23:03
 * Author: yuzhanglong
 * Email: yuzl1123@163.com
 */

import QuickSort from "./QuickSort";

class RandomQuickSort<T> extends QuickSort<T> {
  protected choosePivot(begin: number, end: number) {
    let randomIndexAddition = parseInt(String((Math.random() * (end - begin))));
    this.swap(begin, begin + randomIndexAddition);
  }
}

export default RandomQuickSort;

```

### 计数排序（Counting Sort）

计数排序（Counting sort）是一种稳定的**线性**时间排序算法。

计数排序使用一个额外的数组，其中第i个元素是待排序数组 A 中值等于 i 的元素的个数。然后根据数组 C 来将 A 中的元素排到正确的位置。

计数排序不支持对小数、复杂数据结构类型进行排序。

```typescript
/*
 * File: CountingSort.ts
 * Description: 计数排序
 * Created: 2020-12-12 21:16:18
 * Author: yuzhanglong
 * Email: yuzl1123@163.com
 */

import Sort from "./Sort";

class CountingSort extends Sort<number> {
  // 计数排序只可以处理数字
  public runSort(): void {
    let posCountArray = [];
    let negCountArray = [];
    this.array.forEach(res => {
      if (res >= 0) {
        posCountArray[res] >= 1 ? posCountArray[res]++ : (posCountArray[res] = 1);
      } else {
        let index = res * (-1);
        negCountArray[index] >= 1 ? negCountArray[index]++ : (negCountArray[index] = 1);
      }
    });

    this.array = [];
    for (let i = negCountArray.length; i > 0; i--) {
      if (negCountArray[i] > 0) {
        let cnt = negCountArray[i];
        while (cnt--) {
          this.array.push(i * (-1));
        }
      }
    }

    for (let i = 0; i < posCountArray.length; i++) {
      if (posCountArray[i] > 0) {
        let cnt = posCountArray[i];
        while (cnt--) {
          this.array.push(i);
        }
      }
    }
  }
}

export default CountingSort;
```

### 冒泡排序（Bubble Sort）

冒泡排序重复地走访过要排序的数列，一次比较两个元素，如果他们的顺序错误就把他们交换过来。

在每一趟排序之后，每一个较大的元素都会浮到数组的右侧。

```typescript
/*
 * File: BubbleSort.ts
 * Description: 冒泡排序
 * Created: 2020-12-12 21:14:10
 * Author: yuzhanglong
 * Email: yuzl1123@163.com
 */

import Sort from "./Sort";

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
```

### 选择排序（Selection Sort）

选择排序的基本思路是每次在未排序的数组中找到一个最小的放到相应位置。

```typescript
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
```

## 树

### 数据结构约定

### 二叉搜索树




