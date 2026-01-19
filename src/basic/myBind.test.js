import { describe, it, expect } from "vitest";
import customBind from "./myBind.js";

describe("自定义 bind 方法", () => {
  it("应正确绑定 this 并传递参数", () => {
    const obj = { value: 42 };
    function add(a, b) {
      return this.value + a + b;
    }
    const boundAdd = customBind(add, obj, 1, 2);
    expect(boundAdd()).toBe(45);
  });

  it("当 thisArg 为 null 或 undefined 时，应使用全局对象（严格模式下为 undefined）", () => {
    function getThis() {
      return this;
    }
    // 非严格模式下，globalThis 为全局对象
    const boundGetThis = customBind(getThis, null);
    expect(boundGetThis()).toBe(globalThis);
    const boundGetThis2 = customBind(getThis, undefined);
    expect(boundGetThis2()).toBe(globalThis);
  });

  it("应支持柯里化：bind 时传参 + 调用时传参", () => {
    const obj = { base: 10 };
    function sum(a, b, c) {
      return this.base + a + b + c;
    }
    const curried = customBind(sum, obj, 2, 3);
    expect(curried(5)).toBe(20); // 10+2+3+5
  });

  it("应返回的函数能被 new 调用，此时 this 指向新实例", () => {
    function Person(name) {
      this.name = name;
    }
    const BoundPerson = customBind(Person, { dummy: true }, "Alice");
    const instance = new BoundPerson();
    expect(instance.name).toBe("Alice");
    expect(instance.dummy).toBeUndefined(); // 忽略绑定的 this
  });

  it("应返回的函数具有正确的原型链", () => {
    function Foo() {}
    Foo.prototype.say = () => "hello";
    const BoundFoo = customBind(Foo, {});
    const instance = new BoundFoo();
    expect(instance.say()).toBe("hello");
  });

  it("应返回的函数 length 属性不小于 0", () => {
    function foo(a, b, c) {}
    const bound = customBind(foo, {});
    expect(bound.length).toBeGreaterThanOrEqual(0);
  });

  it("应返回的函数 name 包含 'bound ' 前缀", () => {
    function bar() {}
    const bound = customBind(bar, {});
    expect(bound.name).toMatch(/^bound /);
  });
});
