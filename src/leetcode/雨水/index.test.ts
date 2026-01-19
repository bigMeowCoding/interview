// sum.test.js
import { test } from "vitest";
import { maxArea } from "./index.ts";

test("basic", () => {
  const ret = maxArea([6, 5, 4, 8, 7]);
  console.log(ret);
});
