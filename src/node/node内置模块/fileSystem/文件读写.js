const fs = require('fs');
const path = require('path');

const filePath = path.resolve('../test/yzl.txt');

fs.writeFile(
  filePath,
  'yzl',
  {
    flag: 'a',
  },
  (err) => {
    if (err) {
      console.log(err);
    }
  }
);

fs.readFile(
  filePath,
  {
    encoding: 'utf8',
  },
  (err, data) => {
    console.log(data);
  }
);
