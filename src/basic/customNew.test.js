import customNewd from "./customNew.js";
import { describe, it, expect } from "vitest";
// customNewd 单元测试用例
describe("customNewd", () => {
  it("应使用给定参数创建实例", () => {
    function Foo(a, b) {
      this.a = a;
      this.b = b;
    }
    const instance = customNewd(Foo, 1, 2);
    expect(instance).toBeInstanceOf(Foo);
    expect(instance.a).toBe(1);
    expect(instance.b).toBe(2);
  });

  it("应继承原型方法", () => {
    function Bar() {}
    Bar.prototype.say = () => "hello";
    const instance = customNewd(Bar);
    expect(instance.say()).toBe("hello");
  });

  it("应返回非对象构造函数的原始值", () => {
    function Baz() {
      return 123;
    }
    const instance = customNewd(Baz);
    expect(instance).toBeInstanceOf(Baz);
  });

  it("应返回对象构造函数的显式返回对象", () => {
    const obj = { x: 42 };
    function Qux() {
      return obj;
    }
    const instance = customNewd(Qux);
    expect(instance).toBe(obj);
  });

  it("应处理无参数构造函数", () => {
    function Noop() {}
    const instance = customNewd(Noop);
    expect(instance).toBeInstanceOf(Noop);
  });
});
