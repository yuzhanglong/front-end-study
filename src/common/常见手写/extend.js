function SuperType(name) {
  this.name = name;
  this.forSuper = [1, 2];
  this.from = 'super';
}

SuperType.prototype.superMethod = function () {};
SuperType.prototype.method = function () {};
SuperType.staticSuper = 'staticSuper';

function SubType(name) {
  this.name = name;
  this.forSub = [3, 4];
  this.from = 'sub';
}

SubType.prototype.subMethod = function () {};
SubType.prototype.method = function () {};
SubType.staticSub = 'staticSub';

const myExtends = (SuperType, SubType) => {
  function _SubType(...args) {
    SuperType.call(this, ...args);
    this.__proto__ = _SubType.prototype;
    return SubType.call(this, ...args);
  }

  const inherit = (subClass, superClass) => {
    subClass.prototype.__proto__ = superClass.prototype;
    subClass.prototype.constructor = subClass;
    subClass.__proto__ = superClass;
  };

  inherit(_SubType, SuperType);

  return _SubType;
};

const i = myExtends(SuperType, SubType);

const instance = new i();

console.log(instance);
