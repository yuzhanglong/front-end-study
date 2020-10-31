class Promise {
  // 待处理
  static PENDING = "PENDING";
  // 已完成
  static FULFILLED = "FULFILLED";
  // 拒绝
  static REJECTED = "REJECTED"
  //尽快执行
  static SET_TIMEOUT_CONFIG = 0;

  constructor(executor) {
    this.status = Promise.PENDING;

    // `value`是任何可能的JavaScript合法对象，包括`undefined`、`thenable`、`promise`。
    this.value = undefined;
    // `reason`表示了为什么Promise会被拒绝
    this.reason = undefined;

    // 成功回调
    this.onResolvedCallbacks = [];
    // 失败回调
    this.onRejectedCallbacks = [];

    // resolve 被执行时，Promise状态由 PENDING 变成 FULFILLED
    // 尽量使用箭头函数，否则外界调用时 this 为 window
    const resolve = (value) => {
      if (this.status === Promise.PENDING) {
        this.value = value;
        this.status = Promise.FULFILLED;
        this.onResolvedCallbacks.forEach((fn) => fn());
      }
    }

    // reject 被执行时，Promise状态由 PENDING 变成 REJECTED
    const reject = (reason) => {
      if (this.status === Promise.PENDING) {
        this.reason = reason;
        this.status = Promise.REJECTED;
        this.onRejectedCallbacks.forEach((fn) => fn());
      }
    }

    // 执行
    try {
      executor(resolve, reject);
    } catch (e) {
      // 执行时错误
      reject(e);
    }
  }

  then(onFulfilled, onRejected) {
    onFulfilled = typeof onFulfilled === "function" ? onFulfilled : value => value;
    onRejected = typeof onRejected === "function" ? onRejected : err => {
      throw err;
    };
    let promise2 = new Promise((resolve, reject) => {
      // 处理同步
      if (this.status === Promise.FULFILLED) {
        setTimeout(() => {
          try {
            let x = onFulfilled(this.value);
            Promise.resolvePromise(promise2, x, resolve, reject);
          } catch (e) {
            reject(e);
          }
        }, Promise.SET_TIMEOUT_CONFIG);
      }

      if (this.status === Promise.REJECTED) {
        setTimeout(() => {
          try {
            let x = onRejected(this.reason);
            Promise.resolvePromise(promise2, x, resolve, reject);
          } catch (e) {
            reject(e);
          }
        }, Promise.SET_TIMEOUT_CONFIG);
      }

      // 处理异步
      if (this.status === Promise.PENDING) {
        // 保存回调，将成功和失败的回调分开存储 异步订阅
        this.onResolvedCallbacks.push(() => {
          setTimeout(() => {
            try {
              let x = onFulfilled(this.value);
              Promise.resolvePromise(promise2, x, resolve, reject);
            } catch (e) {
              reject(e);
            }
          }, Promise.SET_TIMEOUT_CONFIG);
        });

        // 失败回调
        this.onRejectedCallbacks.push(() => {
          setTimeout(() => {
            try {
              let x = onRejected(this.reason);
              Promise.resolvePromise(promise2, x, resolve, reject);
            } catch (e) {
              reject(e);
            }
          }, Promise.SET_TIMEOUT_CONFIG);
        })
      }
    });
    return promise2;
  }

  finally(callback) {
    return this.then((data) => {
      return Promise.resolve(callback()).then(() => data);
    }, (err) => {
      return Promise.resolve(callback().then(() => {
        throw err;
      }))
    });
  }

  static resolvePromise(promise, x, resolve, reject) {
    // 防止等待自身
    if (promise === x) {
      return reject(new TypeError("Chaining cycle detected"));
    }
    let called = false;
    if (typeof x === 'function' || (typeof x === 'object' && x !== null)) {
      try {
        let then = x.then;
        if (typeof then === "function") {
          then.call(x, (y) => {
            if (called) {
              return;
            }
            called = true;
            this.resolvePromise(promise, y, resolve, reject);// promise 的 resolve
          }, (r) => {
            if (called) {
              return;
            }
            called = true;
            reject(r);  // promise 的 reject
          })

        } else {
          resolve(x);
        }
      } catch (e) {
        // promise 失败了
        if (called) {
          return;
        }
        called = true;
        reject(e);
      }
    } else {
      resolve(x);
    }
  };

  static resolve(value) {
    return new Promise((resolve, reject) => {
      resolve(value);
    })
  }

  static reject(value) {
    return new Promise((resolve, reject) => {
      reject(value);
    })
  }

  static isPromise(value) {
    if (typeof value === 'function' || (typeof value === 'object' && value !== null)) {
      if (typeof value.then === "function") {
        return true;
      }
    }
    return false;
  }

  static all(values) {
    return new Promise((resolve, reject) => {
      let arr = [];
      let i = 0;

      let processData = (key, value) => {
        arr[key] = value; // after函数
        if (++i === values.length) {
          resolve(arr);
        }
      }
      for (let i = 0; i < values.length; i++) {
        let current = values[i];
        if (Promise.isPromise(current)) {
          current.then((data) => {
            processData(i, data);
          }, reject);
        } else {
          processData(i, current);
        }
      }
    })
  }
}
