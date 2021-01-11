let person = {
  name: "yzl",
  friends: ["aa", "bb", "cc"],
  sayHello: () => {
    console.log("hello");
  }
}
// Object.create()方法创建一个新对象，
// 使用现有的对象来提供新创建的对象的__proto__。

let foo = Object.create(person);

console.log(foo.__proto__ === person)  // true


// 原型式继承非常适合不需要单独创建构造函数，但仍然需要在对象间共享信息的场合。
// 注意：属性中包含的引用值始终会在相关对象间共享，跟使用原型模式是一样的
foo.friends.push("dd");
let bar = Object.create(person);

console.log(bar.friends);  // [ 'aa', 'bb', 'cc', 'dd' ]
bar.sayHello();
