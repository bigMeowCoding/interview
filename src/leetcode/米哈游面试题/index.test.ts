// sum.test.js
import { expect, test } from "vitest";
import {compute} from "./index";

test("basic", () => {
  expect(compute(2)).toBe(1);
  expect(compute(4)).toBe(2);
  expect(compute(7)).toBe(4);
});
