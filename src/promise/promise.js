export default class MyPromise {
  static PENDING = "pending";
  static FULFILLED = "fulfilled";
  static REJECTED = "reject";

  constructor(executor) {
    this.status = MyPromise.PENDING;
    this.value = null;
    this.reason = null;
    this.fulfilledCallbackList = [];
    this.rejectedCallbackList = [];

    const resolve = (value) => {
      if (this.status !== MyPromise.PENDING) {
        return;
      }
      this.status = MyPromise.FULFILLED;
      this.value = value;
      this.fulfilledCallbackList.forEach((cb) => {
        cb(value);
      });
    };

    const reject = (reason) => {
      if (this.status !== MyPromise.PENDING) {
        return;
      }
      this.status = MyPromise.REJECTED;
      this.reason = reason;
      this.rejectedCallbackList.forEach((cb) => {
        cb(reason);
      });
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
      if (this.status === MyPromise.FULFILLED) {
        setTimeout(() => {
          try {
            const x = onFulfilled(this.value);
            this.resolvePromise(promise, x, resolve, reject);
          } catch (e) {
            reject(e);
          }
        }, 0);
      } else if (this.status === MyPromise.REJECTED) {
        setTimeout(() => {
          try {
            const x = onRejected(this.reason);
            this.resolvePromise(promise, x, resolve, reject);
          } catch (e) {
            reject(e);
          }
        }, 0);
      } else {
        this.fulfilledCallbackList.push(() => {
          setTimeout(() => {
            try {
              const x = onFulfilled(this.value);
              this.resolvePromise(promise, x, resolve, reject);
            } catch (e) {
              reject(e);
            }
          }, 0);
        });
        this.rejectedCallbackList.push(() => {
          setTimeout(() => {
            try {
              const x = onRejected(this.reason);
              this.resolvePromise(promise, x, resolve, reject);
            } catch (e) {
              reject(e);
            }
          }, 0);
        });
      }
    });
    return promise;
  }
  resolvePromise(promise, x, resolve, reject) {
    if (promise === x) {
      throw new TypeError("Chaining cycle");
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
}
