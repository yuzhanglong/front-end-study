const EventEmitter = require("events");

const emitter = new EventEmitter();

emitter.on("click", (args) => {
  console.log(args);
  console.log("click!");
});

emitter.on("click", (args) => {
  console.log(args);
  console.log("click2!");
});

emitter.on("hello", (args) => {
  console.log(args);
  console.log("hello");
});


emitter.emit("click", "yzl");

console.log(emitter.eventNames());
console.log(emitter.listenerCount("click"));
