// sum.test.js
import { expect, test } from "vitest";
import { findLengthOfLCIS } from "./index";

test("basic", () => {
  expect(findLengthOfLCIS([1, 3, 5, 4, 7])).toBe(3);
  expect(findLengthOfLCIS([2, 2, 2, 2, 2])).toBe(1);
});
