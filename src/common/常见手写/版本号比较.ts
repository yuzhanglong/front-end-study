// 例如：
// 输入：var versions = ['1.45.0','1.5','6','3.3.3.3.3.3.3']
// 输出：var sorted = ['1.5','1.45.0','3.3.3.3.3.3','6']

export const compareVersion = (version1: string, version2: string) => {
  const v1Arr = version1.split('.');
  const v2Arr = version2.split('.');

  const minLen = Math.min(v1Arr.length, v2Arr.length);
  for (let i = 0; i < minLen; i++) {
    const v1 = parseInt(v1Arr[i]);
    const v2 = parseInt(v2Arr[i]);

    if (v1 === v2) {
      continue;
    }

    if (v1 > v2) {
      return 1;
    }
    if (v1 < v2) {
      return -1;
    }
  }

  if (v1Arr.length === v2Arr.length) {
    return 0;
  }

  return v1Arr.length > v2Arr.length ? 1 : -1;
};

const versions = ['1.45.0', '1.5', '6', '3.3.3.3.3.3.3'];
versions.sort(compareVersion);
console.log(versions);
