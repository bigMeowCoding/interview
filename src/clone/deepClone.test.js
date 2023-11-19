// sum.test.js
import { expect, test, describe, it } from "vitest";

import { deepClone } from "./deepClone";

describe("deepClone", () => {
  it("basicType", () => {
    expect(deepClone(1)).toBe(1);
    expect(deepClone("sdfs")).toBe("sdfs");
    expect(deepClone(true)).toBe(true);
  });
  it("obj", () => {
    let obj = {
      a: 1,
      b: 2,
      c: {
        d: 4,
      },
    };
    const clone = deepClone(obj);
    expect(clone).not.toBe(obj);
    expect(clone.a).toBe(1);
    expect(clone.c.d).toBe(4);
  });
  it("array", () => {
    let arr = [1, 2, 3];
    const cloneArr = deepClone(arr);
    !expect(cloneArr).toEqual(arr);
    expect(cloneArr.length).toBe(3);
    expect(cloneArr[0]).toEqual(1);
    expect(cloneArr[2]).toEqual(3);
  });
  it("circular", () => {
    let obj = {
      a: 1,
      b: 2,
      c: {
        d: 4,
      },
    };
    obj.c.obj = obj;
    const clone = deepClone(obj);
    !expect(clone).toEqual(obj);
    expect(clone.a).toBe(1);
    expect(clone.c.d).toBe(4);
    expect(clone.c.obj.b).toBe(2);
  });
});
