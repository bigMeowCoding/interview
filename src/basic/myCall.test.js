import { describe, it, expect } from "vitest";
import customCall from "./myCall.js";

describe("自定义 call 方法", () => {
  it("应正确绑定 this 并传递参数", () => {
    const obj = { value: 42 };
    function add(a, b) {
      return this.value + a + b;
    }
    expect(customCall(add, obj, 1, 2)).toBe(45);
  });

  it("当 thisArg 为 null 或 undefined 时，应使用全局对象（严格模式下为 undefined）", () => {
    function getThis() {
      return this;
    }
    // 非严格模式下，globalThis 为全局对象
    expect(customCall(getThis, null)).toBe(globalThis);
    expect(customCall(getThis, undefined)).toBe(globalThis);
  });

  it("应正确返回调用结果", () => {
    const obj = { multiplier: 3 };
    function multiply(x) {
      return this.multiplier * x;
    }
    expect(customCall(multiply, obj, 5)).toBe(15);
  });

  it("应正确处理无参数调用", () => {
    const obj = { name: "test" };
    function getName() {
      return this.name;
    }
    expect(customCall(getName, obj)).toBe("test");
  });

  it("应正确修改原对象的属性", () => {
    const obj = { count: 0 };
    function increment() {
      this.count++;
      return this.count;
    }
    expect(customCall(increment, obj)).toBe(1);
    expect(obj.count).toBe(1);
  });
});
