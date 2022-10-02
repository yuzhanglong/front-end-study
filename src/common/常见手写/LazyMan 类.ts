// 设计一个LazyMan类，实现以下功能：

// LazyMan('Tony');
// // Hi I am Tony
// LazyMan('Tony').sleep(10).eat('lunch');
// // Hi I am Tony
// // 等待10秒...
// // I am eating lunch
// LazyMan('Tony').eat('lunch').sleep(10).eat('dinner');
// // Hi I am Tony
// // I am eating lunch
// // 等待10秒...
// // I am eating dinner
// LazyMan('Tony').eat('lunch').eat('dinner').sleepFirst(5).sleep(10).eat('junk food');
// // Hi I am Tony
// // 等待了5秒...
// // I am eating lunch
// // I am eating dinner
// // 等待10秒
// // I am eating junk food

class LazyMan {
  private taskFactories: (() => Promise<any>)[] = [];

  constructor(name: string) {
    console.log(`Hi I am ${name}`);
    setTimeout(() => {
      this.executeTasks();
    }, 0);
  }

  executeTasks() {
    this.taskFactories.reduce((previousValue, promiseFactory) => {
      return previousValue.then(() => {
        return promiseFactory();
      });
    }, Promise.resolve());
  }

  sleep(time: number) {
    this.taskFactories.push(() => {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(true);
        }, time * 1000);
      });
    });

    return this;
  }

  eat(data: string) {
    this.taskFactories.push(() => {
      return new Promise((resolve) => {
        setTimeout(() => {
          console.log(`I am eating ${data}`);
          resolve(true);
        }, 0);
      });
    });
    return this;
  }

  sleepFirst(time: number) {
    this.taskFactories.splice(0, 0, () => {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(true);
        }, time * 1000);
      });
    });

    return this;
  }
}

new LazyMan('Tony')
  .eat('lunch')
  .eat('dinner')
  .sleepFirst(5)
  .sleep(10)
  .eat('junk food');
