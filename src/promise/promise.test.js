
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
    const result = await new Promise(r => promise.then().then(r));
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
        }
    };
    const promise = new MyPromise((resolve) => resolve(thenable));
    const result = await new Promise(r => promise.then(r));
    expect(result).toBe("thenable");
  });

  it("should handle thenables accessing this", async () => {
    const thenable = {
        value: "accessed this",
        then: function(onFulfilled) {
            onFulfilled(this.value);
        }
    };
    const promise = new MyPromise((resolve) => resolve(thenable));
    const result = await new Promise(r => promise.then(r));
    expect(result).toBe("accessed this");
  });

  it("callbacks should be async", async () => {
    const order = [];
    const promise = new MyPromise((resolve) => resolve(1));
    promise.then(() => order.push(2));
    order.push(1);
    
    // Wait for microtasks
    await new Promise(r => setTimeout(r, 0));
    
    expect(order).toEqual([1, 2]);
  });
});
