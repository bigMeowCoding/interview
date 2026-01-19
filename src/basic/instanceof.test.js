import { describe, it, expect } from "vitest";
import { instanceOf } from "./instanceof";
describe("instanceof", function () {
  it("基础测试", function () {
    function fun() {}

    expect(instanceOf([], Array)).toBeTruthy();
    expect(instanceOf({}, Array)).toBeFalsy();

    const obj2 = new fun();

    expect(instanceOf(obj2, fun)).toBeTruthy();
  });

  it("边界情况：null 和 undefined", function () {
    expect(instanceOf(null, Object)).toBeFalsy();
    expect(instanceOf(undefined, Object)).toBeFalsy();
  });

  it("边界情况：原始类型", function () {
    expect(instanceOf(123, Number)).toBeFalsy();
    expect(instanceOf("abc", String)).toBeFalsy();
    expect(instanceOf(true, Boolean)).toBeFalsy();
  });

  it("继承链测试", function () {
    class Parent {}
    class Child extends Parent {}
    const child = new Child();

    expect(instanceOf(child, Child)).toBeTruthy();
    expect(instanceOf(child, Parent)).toBeTruthy();
    expect(instanceOf(child, Object)).toBeTruthy();
  });

  it("自定义构造函数", function () {
    function Animal(name) {
      this.name = name;
    }
    const dog = new Animal("Dog");

    expect(instanceOf(dog, Animal)).toBeTruthy();
    expect(instanceOf(dog, Object)).toBeTruthy();
    expect(instanceOf(dog, Array)).toBeFalsy();
  });
});
