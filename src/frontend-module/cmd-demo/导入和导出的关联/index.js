import { foo, number } from './foo.js';

console.log(foo);
console.log(number);

setTimeout(() => {
  foo.a = 666;
  foo.b = 666;
  number = 6666;
}, 0);
