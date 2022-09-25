// 实现一个具有并发数量限制的异步任务调度器，可以规定最大同时运行的任务。
//
// JS实现一个带并发限制的异步调度器Scheduler，保证同时运行的任务最多有两个。完善下面代码的Scheduler类，使以下程序能够正常输出：

class Scheduler {
  private tasks: (() => Promise<any>)[] = [];
  private runningPromises: Promise<any>[] = [];
  private readonly maxParallel: number = 1;

  constructor(maxParallel: number) {
    this.maxParallel = maxParallel;
  }

  handlePromise(promiseCreator: () => Promise<any>) {
    const promise = promiseCreator();
    this.runningPromises.push(promise);

    promise.then(() => {
      // 该任务已经完成，移除执行队列
      this.runningPromises.splice(this.runningPromises.indexOf(promise), 1);
      this.handleTask();
    });
  }

  add(promiseCreator: () => Promise<any>) {
    if (this.runningPromises.length < this.maxParallel) {
      console.log('队列空闲，添加任务...');
      this.handlePromise(promiseCreator);
    } else {
      this.tasks.push(promiseCreator);
    }
  }

  handleTask() {
    if (this.tasks.length > 0) {
      // 最新的 task
      const promiseCreator = this.tasks.shift();
      this.handlePromise(promiseCreator);
    }
  }
}

const timeout = (time) =>
  new Promise((resolve) => {
    setTimeout(resolve, time);
  });

const scheduler = new Scheduler(2);

const addTask = (time, order) => {
  scheduler.add(() => {
    return timeout(time).then(() => console.log(order));
  });

  //scheduler.add(() => timeout(time)) 参数是一个promise,返回一个promise
};

addTask(1000, '1');
addTask(500, '2');
addTask(300, '3');
addTask(400, '4');

// 整个的完整执行流程：
//
// 起始1、2两个任务开始执行
// 500ms时，2 任务执行完毕，输出2，任务3开始执行
// 800ms时，3 任务执行完毕，输出3，任务4开始执行
// 1000ms时，1 任务执行完毕，输出1，此时只剩下4 任务在执行
// 1200ms时，4 任务执行完毕，输出4

// output: 2 3 1 4
