// 寄生式继承
// 类似于工厂模式
function CreateAnother(original) {
  // 通过调用函数创建一个新对象
  let clone = Object(original);
  // 以某种方式增强这个对象
  clone.sayHi = function () {
    console.log("hi");
  };
  // 返回这个对象
  return clone;
}

let person = {
  name: "Nicholas",
  friends: ["Shelby", "Court", "Van"]
};
let anotherPerson = CreateAnother(person);
anotherPerson.sayHi();
