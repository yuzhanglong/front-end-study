// 递归方案
Array.prototype.myFlatByRecursion = function (depth = 1) {
  let res = [];
  if (depth > 0) {
    this.forEach((item) => {
      if (Array.isArray(item)) {
        res = res.concat(item.myFlatByRecursion(depth - 1));
      } else {
        res.push(item);
      }
    });
  } else {
    return this;
  }
  return res;
}

// 栈方案
Array.prototype.myFlatByStack = function () {
  let res = [];
  let stack = [].concat(this);
  while (stack.length !== 0) {
    let tmp = stack.pop();
    if (Array.isArray(tmp)) {
      stack.push(...tmp);
    } else {
      res.unshift(tmp);
    }
  }
  return res;
}

Array.prototype.myFlatByReduce = function (depth = 1) {
  return depth > 0 ?
    this.reduce((pre, cur) => {
      return pre.concat(Array.isArray(cur) ? cur.myFlatByReduce(depth - 1) : cur);
    }, []) : this;
}


const arr = [0, 1, 2, [[[3, 4]]]];

console.log(arr.myFlatByRecursion(1));
console.log(arr.myFlatByRecursion(2));
console.log(arr.myFlatByRecursion(3));
console.log("====================");
console.log(arr.myFlatByStack());
console.log("====================");
console.log(arr.myFlatByReduce(1));
console.log(arr.myFlatByReduce(2));
console.log(arr.myFlatByReduce(3));
