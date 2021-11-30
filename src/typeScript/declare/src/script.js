let foo = 'hello world'

const greet = (s) => {
  console.log(s)
}

const myLib = {
  makeGreeting: (s) => {
    greet(s)
  },
  numberOfGreetings: 0,
}

class Greeter {
  greeting

  constructor(s) {
    greet(s)
    this.greeting = s
  }

  showGreeting() {
    console.log('greet! -- ' + this.greeting)
  }
}

module.exports = {
  foo,
  greet,
  myLib,
  Greeter,
}
