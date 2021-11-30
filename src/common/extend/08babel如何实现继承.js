// 来看看 babel 如何实现继承，可以看出是寄生组合式继承

// 源代码
// class SuperType {
//   constructor() {
//   }
// }
//
//
// class SubType extends SuperType {
//   constructor() {
//     super();
//   }
// }

// 转化后的代码
'use strict'

function _inheritsLoose(subClass, superClass) {
  subClass.prototype = Object.create(superClass.prototype)
  subClass.prototype.constructor = subClass
  // 继承静态属性
  subClass.__proto__ = superClass
}

var SuperType = function SuperType() {}

var SubType = /*#__PURE__*/ (function (_SuperType) {
  _inheritsLoose(SubType, _SuperType)

  function SubType() {
    return _SuperType.call(this) || this
  }

  return SubType
})(SuperType)
