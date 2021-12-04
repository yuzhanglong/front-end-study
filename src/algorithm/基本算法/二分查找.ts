/**
 * 得到数组中第一个大于等于查找值的位置
 *
 * @param num int整型 查找值
 * @param arr int整型一维数组 有序数组
 * @return int整型
 */
export const lowerBound = (num: number, arr: number[]): number => {
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
};

/**
 * 搜索旋转数组
 *
 * @param nums 旋转数组
 * @param target 搜索数字
 */
export const searchInRotatedSortedArray = (
  nums: number[],
  target: number
): number => {
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
};

/**
 * 执行二分搜索
 *
 * @param nums 被搜索的数组
 * @param start 开始坐标
 * @param end 结束坐标
 * @param target 搜索数字
 * @return 对应下标，如果不存在则返回 -1
 */
export const binarySearch = (
  nums: number[],
  start: number,
  end: number,
  target: number
) => {
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
};
