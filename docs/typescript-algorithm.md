---
draft: true
---

# typescript 数据结构与算法 - 第二部分（进行中）

## 常见算法

本部分将介绍一些常见算法，以一些编程题的形式来展示。

### 回溯算法

回溯算法的本质是穷举（构造决策树），我们可以通过剪枝操作来减小穷举的范围，来看下面的问题：

![](http://cdn.yuzzl.top/blog/20210110234600.png)

我们首先想的是通过穷举的方法来获取所有的组合，例如组合 `[60, 10, 40]`，就有如下排法：

```plain
60 = 60
60 -> 10 = 70
60 -> 10 -> 40 = 110
60 -> 40 = 100
60 -> 40 -> 10 = 110

10 = 10
10 -> 60 = 70
10 -> 60 -> 40 = 110
10 -> 40 = 50
10 -> 40 -> 60 = 110

40 = 40
40 -> 60 = 100
40 -> 60 -> 10 = 110
40 -> 10 = 50
40 -> 10 -> 60 = 110
```

当然，按题目要求，我们不得有重复的组合，也就是 `1, 2, 3` 和 `3, 2, 1` 是重复的，于是有下面的方案，这种就是所谓剪枝（当然，这是题目要求的）：

```plain
60 = 60
60 -> 10 = 70
60 -> 10 -> 40 = 110
60 -> 40 = 100
60 -> 40 -> 10 = 110

10 = 10
10 -> 40 = 50

40 = 40
```

另外，来看前面几行，加入我们要获得和为 **40** 的结果，那么 60 开头的值全部都不需要了，于是我们又有如下的搜索方案，这也属于剪枝，可以看出，比我们刚开始的所有方案少得多！

```plain
60 = 60  // 抛弃所有 60 开头的

10 = 10
10 -> 40 = 50

40 = 40
```

除此之外，回溯算法还有一定的模板化套路，下面是通用的伪代码实现：

```plain
 fn(...):
    for 选择 in 选择列表:
        做选择
        fn(...)
        撤销选择
```

来看此题的解法：

```typescript
export const combinationSum = (num: number[], target: number): number[][] => {
  const result = []
  const current = []

  num = num.sort((a, b) => a - b);

  const solve = (sum, index) => {
    // 超出范围，不会执行
    if (sum > target) {
      return;
    }
    // 值相等，保存结果
    if (sum == target) {
      let res = [...current];
      result.push(res);
      return;
    }

    for (let i = index; i < num.length; i++) {
      if (i === index || num[i] !== num[i - 1]) {
        current.push(num[i])
        solve(sum + num[i], i + 1);
        current.pop()
      }
    }
  }
  solve(0, 0)
  return result;
}
```

### 二分查找

二分查找是一种在有序数组中查找某一特定元素的搜索算法。

搜索过程从数组的中间元素开始，如果中间元素正好是要查找的元素，则搜索过程结束。

如果某一特定元素大于或者小于中间元素，则在数组大于或小于中间元素的那一半中查找，而且跟开始一样从中间元素开始比较。

如果在某一步骤数组为空，则代表找不到。这种搜索算法**每一次比较都使搜索范围缩小一半**。

上述过程可以抽象成一棵决策树，例如对于数组 `[3,4,5,7,24,30,42,54,63,72,87,95]` ，我们可以绘制出如下的决策树：

![](http://cdn.yuzzl.top/blog/20210111233458.png)

例如我们要查找 **24**，所需要走的路径为 **30 -> 5 -> 7 -> 24**。

下面来看这一道题：

![](http://cdn.yuzzl.top/blog/20210112001250.png)

它要我们输出在数组中第一个大于等于查找值的位置。我们可以使用二分查找算法。

维护两个变量 **begin**、**end**，分别表示**起始下标**（0）和**结束下标**（len - 1）。

由于数组是有序的，获取中间值 `mid = (begin + end) / 2`。

如果 `mid` 对应的元素大于等于查找值，那么它**可能是**最终答案，我们让 `end` 等于 `mid` 缩小范围并开始下一轮循环。

如果 `mid` 的元素小于查找值，说明 `mid` 及其左边的值都不符合要求，那么我们让 `begin = mid + 1` 即可。

解法如下：

```typescript
/**
 * 得到数组中第一个大于等于查找值的位置
 *
 * @param num int 整型 查找值
 * @param arr int 整型一维数组 有序数组
 * @return int 整型 数组中第一个大于等于查找值的位置
 */
const lowerBound = (num: number, arr: number[]): number => {
    if (num > arr[arr.length - 1]) {
      return arr.length + 1;
    }
    let begin = 0;
    let end = arr.length - 1;
    while (begin < end) {
      let mid = (begin + end) >> 1;
      if (num <= arr[mid]) {
        end = mid;
      } else {
        begin = mid + 1;
      }
    }
    return end + 1;
  }
```

再来一个问题：**升序排列**的整数数组 nums 在预先未知的某个点上进行了旋转（例如， `[0,1,2,4,5,6,7]` 经旋转后可能变为 `[4,5,6,7,0,1,2]` ）。请你在数组中搜索 target
，如果数组中存在这个目标值，则返回它的索引，否则返回 -1 。

什么叫转动？来看下面的例子：

```plain
0 2 4 7 9
9 0 2 4 7
7 9 0 2 4
4 7 9 0 2
2 4 7 9 0
```

可以看出，通过所谓转动，原来有序的数组变成了一个无序的数组，但是也有很显著的特点 -- 它是由两个**有序数组**组成的！

我们只需要找到待查元素**在哪个有序区间**，然后再查找不就可以了吗？

那么问题就成了**如何找旋转临界点**。我们可以用二分查找的方式寻找临界点！

我们可以维护一个 **left** 和 一个 **right** 下标，获取中间值，如果中间值大于 `num[0]`，说明轴点在中间值右侧，让 `left = mid`，继续搜索即可。

反之，他可能是个临界点，于是让 `right = mid`，最终，`right` 的值就是轴点的值。

```typescript
/**
 * 搜索旋转数组
 *
 * @param nums 旋转数组
 * @param target 搜索数字
 */
export const searchInRotatedSortedArray = (nums: number[], target: number): number => {
    // 获取轴点
    let left = 0;
    let right = nums.length - 1;
    while (left < right) {
      let mid = (left + right) >> 1;
      if (nums[mid] < nums[0]) {
        right = mid;
      } else {
        left = mid + 1;
      }
    }
    // 拿到轴点
    let pivot = right;

    if (target >= nums[0]) {
      // 在左递增区间查找
      return binarySearch(nums, 0, pivot + 1, target);
    } else {
      // 在右递增区间查找
      return binarySearch(nums, pivot, nums.length, target);
    }
  }

/**
 * 执行二分搜索
 *
 * @param nums 被搜索的数组
 * @param start 开始坐标
 * @param end 结束坐标
 * @param target 搜索数字
 * @return 对应下标，如果不存在则返回 -1
 */
export const binarySearch = (nums: number[], start: number, end: number, target: number) => {
  let left = start;
  let right = end - 1;
  while (left <= right) {
    let mid = (left + right) >> 1;
    if (nums[mid] === target) {
      return mid;
    }
    if (nums[mid] > target) {
      right = mid - 1;
    } else {
      left = mid + 1;
    }
  }
  return -1;
}
```

### 贪心

### 分治





