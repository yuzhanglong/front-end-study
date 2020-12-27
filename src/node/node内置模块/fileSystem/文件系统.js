const path = require("path");
const fs = require("fs");


// 同步版
const filePath = path.resolve("../test/yzl.txt");

console.log(filePath);
const info = fs.statSync(filePath);
console.log(info);

// 异步版
fs.stat(filePath, (err, info) => {
  if (err) {
    console.log(err);
    return;
  }
  console.log(info);
});

// 防止回调地狱，promise 方式
fs.promises.stat(filePath)
  .then(res => {
    console.log(res);
  })
  .catch(err => {
    console.log(err);
  })
