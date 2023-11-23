// sum.test.js
import { expect, test, describe, it } from "vitest";

import { deepClone } from "./deepClone";
import { populateGlobal } from "vitest/environments";

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
      fun: (a, b) => {
        return a + b;
      },
    };
    const clone = deepClone(obj);
    expect(clone).not.toBe(obj);
    expect(clone.a).toBe(1);
    expect(clone.c.d).toBe(4);
    expect(obj.fun(1, 2)).toBe(3);
    expect(obj.fun(2, 2)).toBe(4);
  });
  it("array", () => {
    let arr = [1, 2, 3];
    const cloneArr = deepClone(arr);
    expect(cloneArr).not.toBe(arr);
    expect(cloneArr).toEqual(arr);
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
  it("set", () => {
    let set = new Set([1, 2, 2, 3, 3, 4]);
    const cloneSet = deepClone(set);
    expect(cloneSet).not.toBe(set);
    expect(cloneSet.size).toBe(4);
    expect(cloneSet.has(2)).toBeTruthy();
    expect(cloneSet.has(5)).toBeFalsy();
    cloneSet.add(5);
    expect(cloneSet.has(5)).toBeTruthy();
  });
  it("map", () => {
    let map = new Map();
    map.set("key1", 1);
    map.set("key2", { a: 1 });
    map.set("key3", [1, 2, 3]);
    const cloneMap = deepClone(map);
    expect(cloneMap).not.toBe(map);
    expect(cloneMap.has("key1")).toBeTruthy();
    expect(cloneMap.get("key2")).toEqual({ a: 1 });
    expect(cloneMap.get("key3").length).toBe(3);
    expect(cloneMap.get("key3")[1]).toBe(2);
  });
  it("装箱对象", () => {
    let obj = {
      a: new Number(1),
      b: new String("string"),
      c: new Boolean(false),
    };
    let copy = deepClone(obj);
    expect(copy.a).not.toBe(obj.a);
    expect(copy.a.constructor).toBe(Number);
    expect(copy.b.constructor).toBe(String);
    expect(copy.c.constructor).toBe(Boolean);

    expect(copy.a.valueOf()).toBe(1);
    expect(copy.b.toString()).toBe("string");
    expect(copy.c.valueOf()).toBe(false);
  });
  it("正则", () => {
    let reg1 = /^1[34578]\d{9}$/g;
    let copyReg1 = deepClone(reg1);
    expect(copyReg1).not.toBe(reg1);
    expect(copyReg1.test("sdfsdf")).toBeFalsy();
    expect(copyReg1.test("13344444444")).toBeTruthy();
    expect(copyReg1.test("22344444444")).toBeFalsy();
    expect(copyReg1.flags).toBe("g");

    const reg2 = /\w+/gi; // 示例正则表达式，包含全局（g）和不区分大小写（i）标志

    let copyReg2 = deepClone(reg2);

    expect(copyReg2.flags).toBe("gi");
  });
  it("date", () => {
    let date = new Date();
    let copyDate = deepClone(date);
    expect(copyDate).not.toBe(date);
    expect(copyDate.getTime()).toEqual(date.getTime());
  });
  it("error", () => {
    let error = new Error('msg');
    let copyError = deepClone(error);
    expect(copyError).not.toBe(error);
    // expect(copyError.message).toBe(error)
    // console.log(copyError)
  })
});
