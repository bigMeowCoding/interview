import { describe, it, expect } from "vitest";
import { isArray } from "./is-array";

describe("isArray", () => {
  it("returns true for array", () => {
    expect(isArray([])).toBe(true);
    expect(isArray([1, 2, 3])).toBe(true);
    expect(isArray(new Array(3))).toBe(true);
  });

  it("returns false for non-array", () => {
    expect(isArray({})).toBe(false);
    expect(isArray("abc")).toBe(false);
    expect(isArray(123)).toBe(false);
    expect(isArray(null)).toBe(false);
    expect(isArray(undefined)).toBe(false);
    expect(isArray(true)).toBe(false);
    expect(isArray({ length: 3 })).toBe(false);
    expect(isArray({ 0: "a", length: 1 })).toBe(false);
  });

  it("returns false for arguments", () => {
    function fn() {
      expect(isArray(arguments)).toBe(false);
    }
    fn();
  });

  it("returns false for typed array", () => {
    expect(isArray(new Uint8Array(3))).toBe(false);
  });
});
