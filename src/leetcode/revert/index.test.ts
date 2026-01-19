// sum.test.js
import { expect, test } from "vitest";
import { revertNumber } from "./index";

test("basic", () => {
  expect(revertNumber(23456)).toBe(65432);
  expect(revertNumber(-123)).toBe(-321);
expect(revertNumber(-123456789)).toBe(-987654321)
});
