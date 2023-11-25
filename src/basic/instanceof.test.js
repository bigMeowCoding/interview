import { describe, it, expect } from "vitest";
import { instanceOf } from "./instanceof";
describe("instanceof", function () {
  it("basic", function () {
    function fun() {}

    expect(instanceOf([], Array)).toBeTruthy();
    expect(instanceOf({}, Array)).toBeFalsy();

    const obj2 = new fun();

    expect(instanceOf(obj2,fun)).toBeTruthy();
  });
});
