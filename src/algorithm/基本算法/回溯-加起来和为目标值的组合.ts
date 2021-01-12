// 加起来和为目标值的组合

// [100,10,20,70,60,10,50],80

// [[10,10,60],[10,20,50],[10,70],[20,60]]

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

