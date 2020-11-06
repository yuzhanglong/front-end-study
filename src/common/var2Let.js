/*
 * File: var2Let.js
 * Description: 用var实现let
 * Created: 2020-10-28 21:09:39
 * Author: yuzhanglong
 * Email: yuzl1123@163.com
 */

// 下面的代码会输出
// 2
// 2
// 这是由于var的特性所导致的，具体原因可以看一下作用域链的部分
let myFunction = [];
for (var i = 0; i < 2; i++) {
  myFunction[i] = function () {
    console.log(i);
  }
}
myFunction[0]();
myFunction[1]();

// 下面，不允许使用let, 实现预期输入
// 0
// 1

let myFunction2 = [];
for (var i = 0; i < 2; i++) {
  let tmp = function () {
    var t = i;
    myFunction2[i] = function () {
      console.log(t);
    }
  };
  tmp();
}
myFunction2[0]();
myFunction2[1]();
