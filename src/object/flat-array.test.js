import { describe, it, expect } from "vitest";
import { flatArray } from "./flat-array";

describe("flatArray", () => {
  it("flatten one level", () => {
    expect(flatArray([1, [2, 3]])).toEqual([1, 2, 3]);
  });

  it("flatten deeply nested array", () => {
    expect(flatArray([1, [2, [3, [4]]]])).toEqual([1, 2, 3, 4]);
  });

  it("flatten with depth 1", () => {
    expect(flatArray([1, [2, [3]]], 1)).toEqual([1, 2, [3]]);
  });

  it("flatten with depth 2", () => {
    expect(flatArray([1, [2, [3, [4]]]], 2)).toEqual([1, 2, 3, [4]]);
  });

  it("flatten depth 0 returns same array", () => {
    expect(flatArray([1, [2, [3]]], 0)).toEqual([1, [2, [3]]]);
  });

  it("empty array", () => {
    expect(flatArray([])).toEqual([]);
  });

  it("flatten empty nested array", () => {
    expect(flatArray([[], [[]], []])).toEqual([]);
  });

  it("flatten with mixed types", () => {
    expect(flatArray([1, "a", [true, null, { b: 2 }]])).toEqual([
      1,
      "a",
      true,
      null,
      { b: 2 },
    ]);
  });

  it("non-array input throws", () => {
    expect(() => flatArray(123)).toThrow(TypeError);
    expect(() => flatArray({ a: 1 })).toThrow(TypeError);
    expect(() => flatArray(null)).toThrow(TypeError);
  });
});
