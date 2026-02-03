import MyPromise from "./promise.js";
import { describe, it, expect, vi } from "vitest";

describe("MyPromise", () => {
  it("should resolve immediately", async () => {
    const promise = new MyPromise((resolve) => {
      resolve(1);
    });
    const result = await new Promise((r) => promise.then(r));
    expect(result).toBe(1);
  });

  it("should reject immediately", async () => {
    const promise = new MyPromise((_, reject) => {
      reject("error");
    });
    try {
      await new Promise((_, r) => promise.then(null, r));
    } catch (e) {
      expect(e).toBe("error");
    }
  });

  it("should resolve asynchronously", async () => {
    const promise = new MyPromise((resolve) => {
      setTimeout(() => {
        resolve(2);
      }, 10);
    });
    const result = await new Promise((r) => promise.then(r));
    expect(result).toBe(2);
  });

  it("should reject asynchronously", async () => {
    const promise = new MyPromise((_, reject) => {
      setTimeout(() => {
        reject("async error");
      }, 10);
    });
    try {
      await new Promise((_, r) => promise.then(null, r));
    } catch (e) {
      expect(e).toBe("async error");
    }
  });

  it("should support chaining", async () => {
    const promise = new MyPromise((resolve) => {
      resolve(1);
    });
    const result = await new Promise((r) =>
      promise
        .then((val) => val + 1)
        .then((val) => val + 2)
        .then(r)
    );
    expect(result).toBe(4);
  });

  it("should support chaining with async return", async () => {
    const promise = new MyPromise((resolve) => {
      resolve(1);
    });
    const result = await new Promise((r) =>
      promise
        .then((val) => {
          return new MyPromise((resolve) => {
            setTimeout(() => resolve(val + 1), 10);
          });
        })
        .then((val) => val + 2)
        .then(r)
    );
    expect(result).toBe(4);
  });

  it("should catch errors in chain", async () => {
    const promise = new MyPromise((resolve) => {
      resolve(1);
    });
    const error = await new Promise((r) =>
      promise
        .then(() => {
          throw new Error("fail");
        })
        .then(() => {
          // should not be called
        })
        .then(null, (err) => {
          r(err);
        })
    );
    expect(error.message).toBe("fail");
  });

  it("should be pending initially", () => {
    const promise = new MyPromise(() => {});
    expect(promise.status).toBe("pending");
  });

  it("should not change state once settled", () => {
    const promise = new MyPromise((resolve, reject) => {
      resolve(1);
      reject("error");
      resolve(2);
    });
    expect(promise.status).toBe("fulfilled");
    expect(promise.value).toBe(1);
  });

  it("should handle empty then (penetration)", async () => {
    const promise = new MyPromise((resolve) => resolve("foo"));
    const result = await new Promise((r) => promise.then().then(r));
    expect(result).toBe("foo");
  });

  it("should detect circular reference", async () => {
    const promise = new MyPromise((resolve) => resolve(1));
    const p2 = promise.then(() => {
      return p2;
    });

    // We need to wrap this because p2 rejection might not be caught by standard await if not handled
    try {
      await new Promise((_, r) => p2.then(null, r));
    } catch (e) {
      expect(e).toBeInstanceOf(TypeError);
      expect(e.message).toContain("Chaining cycle");
    }
  });

  it("should handle thenables", async () => {
    const thenable = {
      then: (onFulfilled) => {
        onFulfilled("thenable");
      },
    };
    const promise = new MyPromise((resolve) => resolve(thenable));
    const result = await new Promise((r) => promise.then(r));
    expect(result).toBe("thenable");
  });

  it("should handle thenables accessing this", async () => {
    const thenable = {
      value: "accessed this",
      then: function (onFulfilled) {
        onFulfilled(this.value);
      },
    };
    const promise = new MyPromise((resolve) => resolve(thenable));
    const result = await new Promise((r) => promise.then(r));
    expect(result).toBe("accessed this");
  });

  it("callbacks should be async", async () => {
    const order = [];
    const promise = new MyPromise((resolve) => resolve(1));
    promise.then(() => order.push(2));
    order.push(1);

    // Wait for microtasks
    await new Promise((r) => setTimeout(r, 0));

    expect(order).toEqual([1, 2]);
  });

  describe("Static Methods", () => {
    it("MyPromise.resolve should return a resolved promise", async () => {
      const p = MyPromise.resolve(1);
      expect(p).toBeInstanceOf(MyPromise);
      const result = await new Promise((r) => p.then(r));
      expect(result).toBe(1);
    });

    it("MyPromise.resolve should return the same promise if value is a MyPromise", () => {
      const p1 = new MyPromise((resolve) => resolve(1));
      const p2 = MyPromise.resolve(p1);
      expect(p2).toBe(p1);
    });

    it("MyPromise.reject should return a rejected promise", async () => {
      const p = MyPromise.reject("error");
      expect(p).toBeInstanceOf(MyPromise);
      try {
        await new Promise((_, r) => p.then(null, r));
      } catch (e) {
        expect(e).toBe("error");
      }
    });

    it("MyPromise.all should resolve when all promises resolve", async () => {
      const p1 = MyPromise.resolve(1);
      const p2 = new MyPromise((resolve) => setTimeout(() => resolve(2), 10));
      const p3 = 3;

      const pAll = MyPromise.all([p1, p2, p3]);
      const result = await new Promise((r) => pAll.then(r));
      expect(result).toEqual([1, 2, 3]);
    });

    it("MyPromise.all should reject if one promise rejects", async () => {
      const p1 = MyPromise.resolve(1);
      const p2 = new MyPromise((_, reject) =>
        setTimeout(() => reject("fail"), 10)
      );
      const p3 = 3;

      const pAll = MyPromise.all([p1, p2, p3]);
      try {
        await new Promise((_, r) => pAll.then(null, r));
      } catch (e) {
        expect(e).toBe("fail");
      }
    });

    it("MyPromise.race should resolve with the first resolved promise", async () => {
      const p1 = new MyPromise((resolve) => setTimeout(() => resolve(1), 20));
      const p2 = new MyPromise((resolve) => setTimeout(() => resolve(2), 10));

      const pRace = MyPromise.race([p1, p2]);
      const result = await new Promise((r) => pRace.then(r));
      expect(result).toBe(2);
    });

    it("MyPromise.race should reject with the first rejected promise", async () => {
      const p1 = new MyPromise((resolve) => setTimeout(() => resolve(1), 20));
      const p2 = new MyPromise((_, reject) =>
        setTimeout(() => reject("fail"), 10)
      );

      const pRace = MyPromise.race([p1, p2]);
      try {
        await new Promise((_, r) => pRace.then(null, r));
      } catch (e) {
        expect(e).toBe("fail");
      }
    });

    it("MyPromise.allSettled should return all results with status", async () => {
      const p1 = MyPromise.resolve(1);
      const p2 = MyPromise.reject("error");
      const p3 = new MyPromise((resolve) => setTimeout(() => resolve(3), 10));

      const pAllSettled = MyPromise.allSettled([p1, p2, p3]);
      const result = await new Promise((r) => pAllSettled.then(r));

      expect(result).toHaveLength(3);
      expect(result[0]).toEqual({ status: "fulfilled", value: 1 });
      expect(result[1]).toEqual({ status: "rejected", reason: "error" });
      expect(result[2]).toEqual({ status: "fulfilled", value: 3 });
    });
  });
});
