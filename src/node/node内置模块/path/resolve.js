// 注意：当前目录的绝对路径位于 D:\projects\yzl-blog\src\node\node内置模块\path\resolve.js

const path = require("path");

// 如果是 / 的绝对路径，则为根目录
console.log(path.resolve("/home"));  // D:\home

// 如果是相对路径，我们会把这个相对路径转换为绝对路径，然后在拼接
console.log(path.resolve("../home"));
// D:\projects\yzl-blog\src\node\node内置模块\home

console.log(path.resolve("../../home"));
// D:\projects\yzl-blog\src\node\home

// 多个绝对路径会被覆盖
console.log(path.resolve("../home", "../../home/data", "world"));
// D:\projects\yzl-blog\src\node\node内置模块\home\world

// 同上
console.log(path.resolve("./home", "world"));
// D:\projects\yzl-blog\src\node\node内置模块\path\home\world
console.log(path.resolve("./"));
