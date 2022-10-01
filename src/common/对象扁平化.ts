// 实现一个 objectFlat 函数，实现如下的转换功能
//
// const obj = {
//   a: 1,
//   b: [ 1, 2, { c: true }],
//   c: { e: 2, f: 3 },
//   g: null,
// };
// // 转换为
// let objRes = {
//   a: 1,
//   "b[0]": 1,
//   "b[1]": 2,
//   "b[2].c": true,
//   "c.e": 2,
//   "c.f": 3,
//   g: null,
// };

const getNewKey = (prevKey: string, currentKey: string, isArray: boolean) => {
  if (!prevKey) {
    return isArray ? `[${currentKey}]` : `${currentKey}`;
  } else {
    return isArray ? `${prevKey}[${currentKey}]` : `${prevKey}.${currentKey}`;
  }
};

const flat = (prevKey: string, value: any, finalObject = {}) => {
  if (typeof value !== 'object' || value === null) {
    finalObject[prevKey] = value;
  } else {
    for (let [k, v] of Object.entries(value)) {
      const newKey = getNewKey(prevKey, k, Array.isArray(v));
      flat(newKey, v, finalObject);
    }
  }
};

const objectFlat = (obj: any) => {
  const finalObject = {};
  flat('', obj, finalObject);
  return finalObject;
};

console.log(
  objectFlat({
    a: 1,
    b: [1, 2, { c: true }],
    c: { e: 2, f: 3 },
    g: null,
  })
);
