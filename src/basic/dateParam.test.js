import { describe, it, expect } from "vitest";
import { instanceOf } from "./instanceof";
import { dateParamUtil } from "./dateParamUtil.js";
describe("dateParam", function () {
  it("basic", function () {
    expect(dateParamUtil(3600)).toBe(60);
    expect(dateParamUtil(24 * 3600)).toBe(3600);
    expect(dateParamUtil(30 * 24 * 2600)).toBe(24 * 3600);
  });
});
