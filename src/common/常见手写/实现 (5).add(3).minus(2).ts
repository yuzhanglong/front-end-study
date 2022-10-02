// @ts-ignore
Number.prototype.add = function (value: number) {
  // typeof this 为 Object，这里应该是用 valueOf 方法拿到 number 内容，更为优雅
  return this.valueOf() + value;
};

// @ts-ignore
Number.prototype.minus = function (value: number) {
  return this.valueOf() - value;
};

// @ts-ignore
console.log((5).add(3).minus(2));
