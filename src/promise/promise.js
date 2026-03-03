export default class MyPromise {
  static PENDING = "pending";
  static FULFILLED = "fulfilled";
  static REJECTED = "rejected";

  constructor(executor) {
    this.status = MyPromise.PENDING;
    this.value = null;
    this.reason = null;
    this.fulfilledCallbackList = [];
    this.rejectedCallbackList = [];

    let isCalled = false;

    const _resolve = (value) => {
      if (this.status !== MyPromise.PENDING) return;

      if (value === this) {
        return _reject(new TypeError("Chaining cycle"));
      }

      if (
        value &&
        (typeof value === "object" || typeof value === "function")
      ) {
        let then;
        try {
          then = value.then;
        } catch (e) {
          return _reject(e);
        }

        if (typeof then === "function") {
          let called = false;
          try {
            then.call(
              value,
              (y) => {
                if (called) return;
                called = true;
                _resolve(y);
              },
              (r) => {
                if (called) return;
                called = true;
                _reject(r);
              }
            );
          } catch (e) {
            if (called) return;
            _reject(e);
          }
          return;
        }
      }

      this.status = MyPromise.FULFILLED;
      this.value = value;
      this.fulfilledCallbackList.forEach((cb) => {
        cb(value);
      });
    };

    const _reject = (reason) => {
      if (this.status !== MyPromise.PENDING) {
        return;
      }
      this.status = MyPromise.REJECTED;
      this.reason = reason;
      this.rejectedCallbackList.forEach((cb) => {
        cb(reason);
      });
    };

    const resolve = (value) => {
      if (isCalled) return;
      isCalled = true;
      _resolve(value);
    };

    const reject = (reason) => {
      if (isCalled) return;
      isCalled = true;
      _reject(reason);
    };

    try {
      executor(resolve, reject);
    } catch (error) {
      reject(error);
    }
  }

  then(onFulfilled, onRejected) {
    onFulfilled =
      typeof onFulfilled === "function" ? onFulfilled : (value) => value;
    onRejected =
      typeof onRejected === "function"
        ? onRejected
        : (error) => {
            throw error;
          };
    let promise = new MyPromise((resolve, reject) => {
      const runMicrotask = (fn) => {
        queueMicrotask(() => {
          try {
            fn();
          } catch (e) {
            reject(e);
          }
        });
      };
      if (this.status === MyPromise.FULFILLED) {
        runMicrotask(() => {
          const x = onFulfilled(this.value);
          this.resolvePromise(promise, x, resolve, reject);
        });
      } else if (this.status === MyPromise.REJECTED) {
        runMicrotask(() => {
          const x = onRejected(this.reason);
          this.resolvePromise(promise, x, resolve, reject);
        });
      } else {
        this.fulfilledCallbackList.push(() => {
          runMicrotask(() => {
            const x = onFulfilled(this.value);
            this.resolvePromise(promise, x, resolve, reject);
          });
        });
        this.rejectedCallbackList.push(() => {
          runMicrotask(() => {
            const x = onRejected(this.reason);
            this.resolvePromise(promise, x, resolve, reject);
          });
        });
      }
    });
    return promise;
  }

  catch(onRejected) {
    return this.then(null, onRejected);
  }

  finally(onFinally) {
    return this.then(
      (value) => {
        return MyPromise.resolve(onFinally()).then(() => value);
      },
      (reason) => {
        return MyPromise.resolve(onFinally()).then(() => {
          throw reason;
        });
      }
    );
  }

  resolvePromise(promise, x, resolve, reject) {
    if (promise === x) {
      return reject(new TypeError("Chaining cycle"));
    }
    if (x instanceof MyPromise) {
      if (x.status === MyPromise.PENDING) {
        x.then((value) => {
          this.resolvePromise(promise, value, resolve, reject);
        }, reject);
      } else {
        x.then(resolve, reject);
      }
    } else if (
      x !== null &&
      (typeof x === "object" || typeof x === "function")
    ) {
      const then = x.then;
      if (typeof then === "function") {
        let called = false;
        try {
          then.call(
            x,
            (value) => {
              if (called) return;
              called = true;
              this.resolvePromise(promise, value, resolve, reject);
            },
            (reason) => {
              if (called) return;
              called = true;
              reject(reason);
            }
          );
        } catch (error) {
          if (called) return;
          called = true;
          reject(error);
        }
      } else {
        resolve(x);
      }
    } else {
      resolve(x);
    }
  }
  static resolve(value) {
    if (value instanceof MyPromise) {
      return value;
    }
    return new MyPromise((resolve) => {
      resolve(value);
    });
  }
  static reject(reason) {
    return new MyPromise((_, reject) => {
      reject(reason);
    });
  }
  static race(promises) {
    return new MyPromise((resolve, reject) => {
      promises.forEach((promise) => {
        promise.then(resolve, reject);
      });
    });
  }

  static all(promises) {
    let ret = [];
    let count = 0;
    return new MyPromise((resolve, reject) => {
      if (promises.length === 0) {
        resolve(ret);
        return;
      }
      promises.forEach((p, index) => {
        MyPromise.resolve(p).then(
          (val) => {
            ret[index] = val;
            count++;
            if (count === promises.length) {
              resolve(ret);
            }
          },
          reject
        );
      });
    });
  }

  static allSettled(promises) {
    let ret = [];
    let count = 0;
    return new MyPromise((resolve) => {
      if (promises.length === 0) {
        resolve(ret);
        return;
      }
      promises.forEach((p, index) => {
        MyPromise.resolve(p).then(
          (val) => {
            ret[index] = { status: "fulfilled", value: val };
            count++;
            if (count === promises.length) resolve(ret);
          },
          (reason) => {
            ret[index] = { status: "rejected", reason };
            count++;
            if (count === promises.length) resolve(ret);
          }
        );
      });
    });
  }
}
