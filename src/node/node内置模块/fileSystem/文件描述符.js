const fs = require("fs");
const path = require("path");

const filePath = path.resolve("../test/yzl.txt");
fs.open(filePath, undefined, undefined, (err, fd) => {
  if (err) {
    console.log("读取错误！");
    return;
  }

  fs.fstat(fd, ((err1, stats) => {
    console.log(stats);
  }))
})
