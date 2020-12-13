Function.prototype.myCall = function (thisArg, ...args) {
  const fn = this;

  if (thisArg === null || thisArg === undefined) {
    return fn(...args);
  }

  const fnKey = Symbol("function key");
  thisArg[fnKey] = fn;
  let res = thisArg[fnKey](...args);
  Reflect.deleteProperty(thisArg, fnKey);
  return res;
}

Function.prototype.myApply = function (thisArg, args) {
  const fn = this;

  if (thisArg === null || thisArg === undefined) {
    return fn(args);
  }

  const fnKey = Symbol("function key");
  thisArg[fnKey] = fn;
  let res = thisArg[fnKey](args);
  Reflect.deleteProperty(thisArg, fnKey);
  return res;
}

Function.prototype.myBind = function (thisArg, ...args) {
  const fn = this;
  const boundFn = function (...otherArgs) {
    return fn.call(new.target ? this : thisArg, ...args, ...otherArgs);
  }
  // 无论何时，只要创建一个函数，就会按照特定的规则为这个函数创建一个 prototype 属性（指向原型对象）
  boundFn.prototype = Object.create(fn.prototype);
  // 默认情况下，所有原型对象自动获得一个名为 constructor 的属性，指回与之关联的构造函数
  boundFn.prototype.constructor = boundFn;

  Object.defineProperties(boundFn, {
    name: {
      value: `bound ${fn.name}`
    },
    length: {
      value: fn.length
    }
  })
  return boundFn;
}
