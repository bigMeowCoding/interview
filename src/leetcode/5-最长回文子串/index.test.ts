// sum.test.js
import { expect, test } from "vitest";
import { longestPalindrome } from "./index";

test("basic", () => {
  expect(longestPalindrome("babad")).toBe("bab");
  expect(longestPalindrome("cbbd")).toBe("bb");
});
