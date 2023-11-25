import { describe, it, expect } from "vitest";
import { instanceOf } from "./instanceof";
import { mockNew } from "./mockNew";
describe("mockNew", function () {
  it("没有返回值", () => {
    function f1() {}
    const proto = {
      b: 1,
    };
    function f1() {}
    f1.prototype = proto;
    const ret1 = mockNew(f1);
    expect(ret1).toBeTypeOf("object");

    expect(Object.getPrototypeOf(ret1)).toBe(proto);
  });
  it("basic", function () {
    function fun1(a) {
      return { a };
    }

    const ret1 = mockNew(fun1, 1);
    expect(ret1.a).toBe(1);
  });
});
