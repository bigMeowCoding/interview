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
      this.onFulfilledCallbacks.forEach((fn) => fn());
    };

    const reject = (reason) => {
      if (this.status !== MyPromise.PENDING) return;
      this.status = MyPromise.REJECTED;
      this.reason = reason;
      this.onRejectedCallbacks.forEach((fn) => fn());
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
        : (reason) => {
            throw reason;
          };

    const promise2 = new MyPromise((resolve, reject) => {
      if (this.status === MyPromise.FULFILLED) {
        setTimeout(() => {
          try {
            const x = onFulfilled(this.value);
            this.resolvePromise(promise2, x, resolve, reject);
          } catch (error) {
            reject(error);
          }
        }, 0);
      } else if (this.status === MyPromise.REJECTED) {
        setTimeout(() => {
          try {
            const x = onRejected(this.reason);
            this.resolvePromise(promise2, x, resolve, reject);
          } catch (error) {
            reject(error);
          }
        }, 0);
      } else {
        this.onFulfilledCallbacks.push(() => {
          setTimeout(() => {
            try {
              const x = onFulfilled(this.value);
              this.resolvePromise(promise2, x, resolve, reject);
            } catch (error) {
              reject(error);
            }
          });
        });
        this.onRejectedCallbacks.push(() => {
          setTimeout(() => {
            try {
              const x = onRejected(this.reason);
              this.resolvePromise(promise2, x, resolve, reject);
            } catch (error) {
              reject(error);
            }
          }, 0);
        });
      }
    });
    return promise2;
  }
  resolvePromise(promise2, x, resolve, reject) {
    if (promise2 === x) {
      reject(new TypeError("Chaining cycle detected for promise"));
      return;
    }
    if (x instanceof MyPromise) {
      if (x.status === MyPromise.PENDING) {
        x.then((value) => {
          this.resolvePromise(promise2, value, resolve, reject);
        }, reject);
      } else {
        x.then(resolve, reject);
      }
    } else if (
      x !== null &&
      (typeof x === "object" || typeof x === "function")
    ) {
      let called = false;
      try {
        let then = x.then;
        if (typeof then === "function") {
          then.call(
            x,
            (y) => {
              if (called) return;
              called = true;
              this.resolvePromise(promise2, y, resolve, reject);
            },
            (reason) => {
              if (called) return;
              called = true;
              reject(reason);
            }
          );
        } else {
          resolve(x);
        }
      } catch (e) {
        if (called) return;
        called = true;
        reject(e);
      }
    } else {
      resolve(x);
    }
  }
}

export default MyPromise;
