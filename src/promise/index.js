export const State = {
  pending: "pending",
  fullfill: "fullfill",
  rejected: "rejected",
};
export function MyPromise(fn) {
  const self = this;
  self.state = State.pending;
  self.value = null;

  if (typeof fn !== "function") {
    throw new Error("must have function fn params");
  }
  function resolve(value) {
    if (value instanceof MyPromise) {
      return value.then(resolve, reject);
    }
    setTimeout(() => {
      if (self.state !== State.pending) {
        return;
      }

      self.state = State.fullfill;
      self.value = value;
      self.onFullfill.forEach((fun) => {
        fun(value);
      });
    });
  }
  function reject(reson) {
    if (reson instanceof MyPromise) {
      return reson.then(resolve, reject);
    }

    setTimeout(() => {
      if (self.state !== State.pending) {
        return;
      }

      self.state = State.rejected;
      self.value = reson;
      self.onRejected.forEach((fun) => {
        fun(reson);
      });
    });
  }

  self.onFullfill = [];
  self.onRejected = [];

  try {
    fn(resolve, reject);
  } catch (e) {
    reject(e);
  }
}
MyPromise.prototype.then = function (onFullfill, onRejected) {
  const self = this;
  onFullfill = typeof onFullfill === "function" ? onFullfill : (value) => value;
  onRejected =
    onRejected && typeof onRejected === "function"
      ? onRejected
      : (value) => {
          throw value;
        };
  return new MyPromise((resolve, reject) => {
    const fullfill = () => {
      try {
        const result = onFullfill(self.value);
        return result instanceof MyPromise
          ? result.then(resolve, reject)
          : resolve(result);
      } catch (e) {
        reject(e);
      }
    };
    const rejected = () => {
      try {
        const result = onRejected(self.value);
        return result instanceof MyPromise
          ? result.then(resolve, reject)
          : reject(result);
      } catch (e) {
        reject(e);
      }
    };
    if (this.state === State.pending) {
      this.onFullfill.push(fullfill);
      this.onRejected.push(rejected);
    }

    if (this.state === State.fullfill) {
      fullfill(this.value);
    }
    if (this.state === State.rejected) {
      rejected(this.value);
    }
  });
};
