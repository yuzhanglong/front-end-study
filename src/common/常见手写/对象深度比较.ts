const isObject = (value: any) => {
  return typeof value === 'object' && value !== null;
};

const deepEqual = (obj1: any, obj2: any) => {
  // 基本类型
  if (!isObject(obj1) && !isObject(obj2)) {
    return obj1 === obj2;
  }

  if (obj1 === obj2) {
    return true;
  }

  const obj1Keys = Object.keys(obj1);
  const obj2Keys = Object.keys(obj2);

  // 对象之间比较，发现 key 长度不同，直接返回 false
  if (obj1Keys.length !== obj2Keys.length) {
    return false;
  }

  for (let key of obj1Keys) {
    if (!deepEqual(obj1[key], obj2[key])) {
      return false;
    }
  }

  return true;
};

console.log(deepEqual({ a: 1, b: 2, c: 3 }, { a: 1, b: 2, c: 3 }));
console.log(
  deepEqual(
    {
      a: 1,
      b: {
        a: 1,
        b: 2,
      },
      c: 3,
    },
    {
      a: 1,
      b: {
        a: 1,
        b: 2,
      },
      c: 3,
    }
  )
);
