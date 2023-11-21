import { expect, test, describe, it, vi } from "vitest";
import { MyPromise, State } from "./index";

describe("promise", function () {
  it("是一个类", () => {
    expect(MyPromise).toBeTypeOf("function");
    expect(MyPromise.prototype).toBeTypeOf("object");
  });
  it("必须接受一个函数", () => {
    expect(() => {
      new MyPromise();
    }).toThrow(new Error("must have function fn params"));
  });
  it("基本参数", () => {
    const mockFn = vi.fn();
    new MyPromise((resolve, reject) => {
      mockFn();
      expect(resolve).toBeTypeOf("function");
      expect(reject).toBeTypeOf("function");
    });

    expect(mockFn).toHaveBeenCalled();
  });
  it("resolve call", (done) => {
    let called = false;
    const p = new MyPromise((resolve, reject) => {
      expect(called).toBeFalsy();
      resolve(true);
      setTimeout(() => {
        expect(called).toBeTruthy();
      });
    });
    p.then(() => {
      called = true;
    });
  });
  it("reject call", (done) => {
    let called = false;
    const p = new MyPromise((resolve, reject) => {
      expect(called).toBeFalsy();
      reject(true);
      setTimeout(() => {
        expect(called).toBeTruthy();
      });
    });
    p.then(null, () => {
      called = true;
    });
  });

  it("基本功能", () => {
    const mockFn = vi.fn();
    const promise = new MyPromise((resolve, reject) => {
      resolve(1);
      resolve(2);
      setTimeout(() => {
        expect(promise.state).toBe(State.fullfill);
        expect(promise.value).toBe(1);
        expect(mockFn).toHaveBeenCalledWith(1);
        setTimeout(() => {});
      });
    });
    promise.then(mockFn);
  });

  it("then", () => {
    const mockFn = vi.fn();
    const p1 = new MyPromise((resolve, reject) => {
      resolve(1);
    });
    expect(p1 instanceof MyPromise).toBeTruthy();

    p1.then((d) => {
      return d + 1;
    }).then((d) => {
      expect(d).toBe(2);
    });
  });
  it("then catch", () => {
    const mockFn = vi.fn();
    const p1 = new MyPromise((resolve, reject) => {
      reject(1);
    });
    expect(p1 instanceof MyPromise).toBeTruthy();

    p1.then(null, (d) => {
      return d + 1;
    }).then(null, (d) => {
      expect(d).toBe(2);
    });
  });
});
