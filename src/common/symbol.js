// 私有属性
const privateField = Symbol();

class MyClass {
  constructor() {
    this[privateField] = 'hello world';
  }

  getField() {
    return this[privateField];
  }

  setField(val) {
    this[privateField] = val;
  }
}

// 防止属性污染
Function.prototype.myCall = function (context) {
  // 用于防止 Function.prototype.myCall() 直接调用
  if (typeof this !== 'function') {
    return undefined;
  }
  context = context || global;
  const fn = Symbol();
  context[fn] = this;
  const args = [...arguments].slice(1);
  const result = context[fn](...args);
  delete context[fn];
  return result;
};

let myClass = new MyClass();

console.log(myClass.getField());
console.log(myClass.getField.myCall(myClass));
