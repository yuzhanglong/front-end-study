const noop = () => {
  return undefined;
};

const isFunction = (fn) => {
  return typeof fn === 'function';
};

const errorFn = (e) => {
  throw e;
};

class MyPromise {
  constructor(executor) {
    this.state = 'PENDING';
    try {
      executor(this.resolve.bind(this), this.reject.bind(this));
    } catch (e) {
      this.reject(e);
    }
  }

  resolve(value) {
    if (this.state !== 'PENDING') {
      return;
    }
    this.state = 'FULFILLED';
    this.result = value;
    queueMicrotask(() => {
      if (!this.onFulfilledFunction) {
        return;
      }

      try {
        const returnValue = this.onFulfilledFunction(this.result);
        const isReturnValuePromise = returnValue instanceof MyPromise;

        if (!isReturnValuePromise) {
          this.thenPromiseResolve(returnValue);
        } else {
          returnValue.then(this.thenPromiseResolve, this.thenPromiseReject);
        }
      } catch (e) {
        this.thenPromiseReject(e);
      }
    });
  }

  reject(error) {
    if (this.state !== 'PENDING') {
      return;
    }
    this.state = 'REJECTED';
    this.result = error;

    queueMicrotask(() => {
      if (!this.onRejectedFunction) {
        return;
      }

      try {
        const rejectReturnValue = this.onRejectedFunction(this.result);
        const isRejectReturnValuePromise =
          rejectReturnValue instanceof MyPromise;

        if (!isRejectReturnValuePromise) {
          this.thenPromiseResolve(rejectReturnValue);
        } else {
          rejectReturnValue.then(
            this.thenPromiseResolve,
            this.thenPromiseReject
          );
        }
      } catch (e) {
        this.thenPromiseReject(e);
      }
    });
  }

  then(onFulfilled, onRejected) {
    // 如果 onFulfill 不是函数，替换之
    this.onFulfilledFunction = isFunction(onFulfilled) ? onFulfilled : noop;
    this.onRejectedFunction = isFunction(onRejected) ? onRejected : errorFn;

    // 新的 promise 实例
    return new MyPromise((resolve, reject) => {
      this.thenPromiseResolve = resolve;
      this.thenPromiseReject = reject;
    });
  }

  catch(onRejected) {
    return this.then(undefined, onRejected);
  }

  static resolve(value) {
    const isValuePromise = value instanceof MyPromise;

    if (isValuePromise) {
      return value;
    }
    return new MyPromise((resolve) => {
      resolve(value);
    });
  }

  static reject(value) {
    return new MyPromise((_, reject) => {
      reject(value);
    });
  }
}
