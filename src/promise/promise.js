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
  static resolve(value) {
    if (value instanceof MyPromise) {
      return value;
    }
    return new MyPromise((resolve) => resolve(value));
  }
  static reject(reason) {
    return new MyPromise((resolve, reject) => reject(reason));
  }
  static all(promises) {
    return new MyPromise((resolve, reject) => {
      let count = 0;
      let result = [];
      promises.forEach((promise, index) => {
        MyPromise.resolve(promise).then(
          (val) => {
            result[index] = val;
            count++;
            if (count === promises.length) {
              resolve(result);
            }
          },
          (err) => {
            reject(err);
          }
        );
      });
    });
  }
  static race(promises) {
    return new MyPromise((resolve, reject) => {
      promises.forEach((promise) => {
        MyPromise.resolve(promise).then(resolve, reject);
      });
    });
  }
  static allSettled(promises) {
    return new MyPromise((resolve, reject) => {
      let count = 0;
      let result = [];
      promises.forEach((promise, index) => {
        MyPromise.resolve(promise).then(
          (val) => {
            count++;
            result[index] = {
              status: MyPromise.FULFILLED,
              value: val,
            };
            if (count === promises.length) {
              resolve(result);
            }
          },
          (err) => {
            count++;
            result[index] = {
              status: MyPromise.REJECTED,
              reason: err,
            };
            if (count === promises.length) {
              resolve(result);
            }
          }
        );
      });
    });
  }
}

export default MyPromise;
