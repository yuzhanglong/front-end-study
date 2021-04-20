import {foo, greet, Greeter, myLib} from "./src/script";

console.log(foo);

greet({
  greeting: "hahah",
  duration: 4000
});

myLib.makeGreeting("hello");

console.log(myLib.numberOfGreetings);


let gt = new Greeter("hello world");
gt.showGreeting();
console.log(gt.greeting);
