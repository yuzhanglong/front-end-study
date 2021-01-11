const fs = require("fs");

const path = require("path");

const filePath = path.resolve("../test/myFolder");

if (!fs.existsSync(filePath)) {
  fs.mkdir(filePath, err => {
    console.log(err);
  })
}

// 读取文件夹中的内容
fs.readdir(filePath, (err, fs) => {
  console.log(fs);
})

const getFiles = (dir) => {
  fs.readdir(dir, {
    withFileTypes: true
  }, (err, fs) => {
    for (let f of fs) {
      if (f.isDirectory()) {
        getFiles(path.resolve(filePath, f.name));
      } else {
        console.log(f.name);
      }
    }
  })
}

getFiles(filePath);
