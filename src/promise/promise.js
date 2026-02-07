class MyPromise {
  static PENDING = "pending";
  static FULFILLED = "fulfilled";
  static REJECTED = "rejected";

  constructor(executor) {
    this.status = MyPromise.PENDING;
    this.value = null;
    this.reason = null;
    this.onFulfilledCallbacks = [];
    this.onRejectedCallbacks = [];

    const resolve = (value) => {
      if (this.status !== MyPromise.PENDING) return;
      this.status = MyPromise.FULFILLED;
      this.value = value;
      this.onFulfilledCallbacks.forEach((callback) => callback(this.value));
    };
    const reject = (reason) => {
      if (this.status !== MyPromise.PENDING) return;
      this.status = MyPromise.REJECTED;
      this.reason = reason;
      this.onRejectedCallbacks.forEach((callback) => callback(this.reason));
    };
    try {
      executor(resolve, reject);
    } catch (error) {
      reject(error);
    }
  }
  then(onFulfilled, onRejected) {
    onFulfilled = typeof onFulfilled === "function" ? onFulfilled : (v) => v;
    onRejected =
      typeof onRejected === "function"
        ? onRejected
        : (r) => {
            throw r;
          };
    let _promise = new MyPromise((resolve, reject) => {
      if (this.status === MyPromise.FULFILLED) {
        setTimeout(() => {
          try {
            let ret = onFulfilled(this.value);
            this.resolvePromise(_promise, ret, resolve, reject);
          } catch (error) {
            reject(error);
          }
        }, 0);
      } else if (this.status === MyPromise.REJECTED) {
        setTimeout(() => {
          try {
            let ret = onRejected(this.reason);
            this.resolvePromise(_promise, ret, resolve, reject);
          } catch (error) {
            reject(error);
          }
        }, 0);
      } else {
        this.onFulfilledCallbacks.push(() => {
          setTimeout(() => {
            try {
              let ret = onFulfilled(this.value);
              this.resolvePromise(_promise, ret, resolve, reject);
            } catch (error) {
              reject(error);
            }
          }, 0);
        });
        this.onRejectedCallbacks.push(() => {
          setTimeout(() => {
            try {
              let ret = onRejected(this.reason);
              this.resolvePromise(_promise, ret, resolve, reject);
            } catch (error) {
              reject(error);
            }
          }, 0);
        });
      }
    });
    return _promise;
  }
  resolvePromise(promise, value, resolve, reject) {
    if (promise === value) {
      throw new TypeError("Chaining cycle detected for promise");
    }
    if (value instanceof MyPromise) {
      if (value.status === MyPromise.PENDING) {
        value.then(
          (v) => this.resolvePromise(promise, v, resolve, reject),
          reject
        );
      } else {
        value.then(resolve, reject);
      }
    } else if (
      (typeof value === "object" || typeof value === "function") &&
      value !== null
    ) {
      let called = false;
      try {
        let then = value.then;
        if (typeof then === "function") {
          then.call(
            value,
            (v) => {
              if (called) return;
              called = true;
              this.resolvePromise(promise, v, resolve, reject);
            },
            (r) => {
              if (called) return;
              called = true;
              reject(r);
            }
          );
        } else {
          resolve(value);
        }
      } catch (error) {
        if (called) return;
        called = true;
        reject(error);
      }
    } else {
      resolve(value);
    }
  }
}

export default MyPromise;
