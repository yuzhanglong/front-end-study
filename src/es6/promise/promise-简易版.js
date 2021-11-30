class MyPromise {
  state;

  constructor(executor) {
    try {
      executor();
    } catch (e) {
      console.log(e);
    }
  }

  resolve(value) {
    if (this.state !== 'PENDING') {
      return;
    }
    this.state = 'FULFILLED';
    this.result = value;
  }
}
