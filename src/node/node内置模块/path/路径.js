const path = require('path');
const basePath = '/User';

const fileName = 'foo.js';

const filePath = path.resolve(basePath, fileName); // resolve 会判断路径中是否有 ‘/' '../' 之类

console.log(filePath); // D:\User\foo.js 会被自动转换

const myPath = '/User/bar.js';

console.log(path.dirname(filePath)); // D:\User
console.log(path.basename(filePath)); // foo.js
console.log(path.extname(myPath)); // 扩展名

const basePath2 = 'User';
const f = 'yzl.js';

console.log(path.join(basePath2, f));
