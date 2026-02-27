import MyPromise from "./promise.js";
import { describe, it, expect } from "vitest";

describe("MyPromise", () => {
  it("should resolve immediately", () => {
    const promise = new MyPromise((resolve) => {
      resolve(1);
    });
    return promise.then((result) => {
      expect(result).toBe(1);
    });
  });

  it("should reject immediately", () => {
    const promise = new MyPromise((_, reject) => {
      reject("error");
    });
    return promise.then(null, (e) => {
      expect(e).toBe("error");
    });
  });

  it("should resolve asynchronously", () => {
    const promise = new MyPromise((resolve) => {
      setTimeout(() => {
        resolve(2);
      }, 10);
    });
    return promise.then((result) => {
      expect(result).toBe(2);
    });
  });

  it("should reject asynchronously", () => {
    const promise = new MyPromise((_, reject) => {
      setTimeout(() => {
        reject("async error");
      }, 10);
    });
    return promise.then(null, (e) => {
      expect(e).toBe("async error");
    });
  });

  it("should support chaining", () => {
    const promise = new MyPromise((resolve) => {
      resolve(1);
    });
    return promise
      .then((val) => val + 1)
      .then((val) => val + 2)
      .then((result) => {
        expect(result).toBe(4);
      });
  });

  it("should support chaining with async return", () => {
    const promise = new MyPromise((resolve) => {
      resolve(1);
    });
    return promise
      .then((val) => {
        return new MyPromise((resolve) => {
          setTimeout(() => resolve(val + 1), 10);
        });
      })
      .then((val) => val + 2)
      .then((result) => {
        expect(result).toBe(4);
      });
  });

  it("should catch errors in chain", () => {
    const promise = new MyPromise((resolve) => {
      resolve(1);
    });
    return promise
      .then(() => {
        throw new Error("fail");
      })
      .then(() => {
        // should not be called
      })
      .then(null, (err) => {
        expect(err.message).toBe("fail");
      });
  });

  it("should support catch method", () => {
    const promise = new MyPromise((_, reject) => reject("error"));
    return promise.catch((e) => {
      expect(e).toBe("error");
    });
  });

  it("should support catch in chain", () => {
    const promise = new MyPromise((resolve) => resolve(1));
    return promise
      .then(() => {
        throw new Error("caught");
      })
      .catch((err) => {
        expect(err.message).toBe("caught");
      });
  });

  it("should allow outer catch to catch inner layer errors", () => {
    const promise = new MyPromise((resolve) => resolve(1));
    return promise
      .then((val) => val + 1)
      .then((val) => {
        throw new Error("inner error");
      })
      .then((val) => val + 1)
      .then((val) => val + 1)
      .catch((e) => {
        expect(e.message).toBe("inner error");
      });
  });

  it("should allow outer catch to catch errors from nested promise", () => {
    const promise = new MyPromise((resolve) => resolve(1));
    return promise
      .then((val) => {
        return new MyPromise((_, reject) => {
          setTimeout(() => reject("nested reject"), 10);
        });
      })
      .then((val) => val + 1)
      .catch((e) => {
        expect(e).toBe("nested reject");
      });
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

  it("should handle empty then (penetration)", () => {
    const promise = new MyPromise((resolve) => resolve("foo"));
    return promise.then().then((result) => {
      expect(result).toBe("foo");
    });
  });

  it("should detect circular reference", () => {
    const promise = new MyPromise((resolve) => resolve(1));
    const p2 = promise.then(() => {
      return p2;
    });
    return p2.then(null, (e) => {
      expect(e).toBeInstanceOf(TypeError);
      expect(e.message).toContain("Chaining cycle");
    });
  });

  it("should handle thenables", () => {
    const thenable = {
      then: (onFulfilled) => {
        onFulfilled("thenable");
      },
    };
    const promise = new MyPromise((resolve) => resolve(thenable));
    // .then(x => x) 触发 resolvePromise 对 thenable 的解包
    return promise.then((x) => x).then((result) => {
      expect(result).toBe("thenable");
    });
  });

  it("should handle thenables accessing this", () => {
    const thenable = {
      value: "accessed this",
      then: function (onFulfilled) {
        onFulfilled(this.value);
      },
    };
    const promise = new MyPromise((resolve) => resolve(thenable));
    return promise.then((x) => x).then((result) => {
      expect(result).toBe("accessed this");
    });
  });

  it("callbacks should run as microtasks", () => {
    const order = [];
    const promise = new MyPromise((resolve) => resolve(1));
    promise.then(() => order.push(2));
    order.push(1);

    return MyPromise.resolve().then(() => {
      expect(order).toEqual([1, 2]);
    });
  });

  it("callbacks should run before setTimeout (microtask before macrotask)", () => {
    const order = [];
    const promise = new MyPromise((resolve) => resolve(1));
    promise.then(() => order.push(2));
    setTimeout(() => order.push(3), 0);
    order.push(1);

    return new MyPromise((r) => setTimeout(r, 0)).then(() => {
      expect(order).toEqual([1, 2, 3]);
    });
  });

  describe("Static Methods", () => {
    it("MyPromise.resolve should return a resolved promise", () => {
      const p = MyPromise.resolve(1);
      expect(p).toBeInstanceOf(MyPromise);
      return p.then((result) => {
        expect(result).toBe(1);
      });
    });

    it("MyPromise.resolve should return the same promise if value is a MyPromise", () => {
      const p1 = new MyPromise((resolve) => resolve(1));
      const p2 = MyPromise.resolve(p1);
      expect(p2).toBe(p1);
    });

    it("MyPromise.reject should return a rejected promise", () => {
      const p = MyPromise.reject("error");
      expect(p).toBeInstanceOf(MyPromise);
      return p.then(null, (e) => {
        expect(e).toBe("error");
      });
    });

    it("MyPromise.all should resolve when all promises resolve", () => {
      const p1 = MyPromise.resolve(1);
      const p2 = new MyPromise((resolve) => setTimeout(() => resolve(2), 10));
      const p3 = 3;

      const pAll = MyPromise.all([p1, p2, p3]);
      return pAll.then((result) => {
        expect(result).toEqual([1, 2, 3]);
      });
    });

    it("MyPromise.all should reject if one promise rejects", () => {
      const p1 = MyPromise.resolve(1);
      const p2 = new MyPromise((_, reject) =>
        setTimeout(() => reject("fail"), 10)
      );
      const p3 = 3;

      const pAll = MyPromise.all([p1, p2, p3]);
      return pAll.then(null, (e) => {
        expect(e).toBe("fail");
      });
    });

    it("MyPromise.race should resolve with the first resolved promise", () => {
      const p1 = new MyPromise((resolve) => setTimeout(() => resolve(1), 20));
      const p2 = new MyPromise((resolve) => setTimeout(() => resolve(2), 10));

      const pRace = MyPromise.race([p1, p2]);
      return pRace.then((result) => {
        expect(result).toBe(2);
      });
    });

    it("MyPromise.race should reject with the first rejected promise", () => {
      const p1 = new MyPromise((resolve) => setTimeout(() => resolve(1), 20));
      const p2 = new MyPromise((_, reject) =>
        setTimeout(() => reject("fail"), 10)
      );

      const pRace = MyPromise.race([p1, p2]);
      return pRace.then(null, (e) => {
        expect(e).toBe("fail");
      });
    });

    it("MyPromise.allSettled should return all results with status", () => {
      const p1 = MyPromise.resolve(1);
      const p2 = MyPromise.reject("error");
      const p3 = new MyPromise((resolve) => setTimeout(() => resolve(3), 10));

      const pAllSettled = MyPromise.allSettled([p1, p2, p3]);
      return pAllSettled.then((result) => {
        expect(result).toHaveLength(3);
        expect(result[0]).toEqual({ status: "fulfilled", value: 1 });
        expect(result[1]).toEqual({ status: "rejected", reason: "error" });
        expect(result[2]).toEqual({ status: "fulfilled", value: 3 });
      });
    });
  });
});
