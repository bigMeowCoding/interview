// sum.test.js
import { expect, test } from "vitest";

import { MinHeap } from "./heap";

test("basic", () => {
  const heap = new MinHeap();
  let arr = [3, 2, 1, 5, 6, 4];
  for (let num of arr) {
    heap.insert(num);
  }

  expect(heap.extractMin()).toBe(1);
  expect(heap.size()).toBe(5);
  expect(heap.extractMin()).toBe(2);
  expect(heap.extractMin()).toBe(3);
});
