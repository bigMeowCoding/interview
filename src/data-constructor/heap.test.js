// sum.test.js
import { expect, it, describe } from "vitest";

import { MinHeap } from "./min-heap";
import { MaxHeap } from "./max-heap";

describe("minheap", function () {
  it("basic", () => {
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
});

describe("maxHeap", function () {
  it("basic", () => {
    const heap = new MaxHeap();
    let arr = [3, 2, 1, 5, 6, 4];
    for (let num of arr) {
      heap.add(num);
    }
    console.log(heap.stack, "heap");
    expect(heap.extractMax()).toBe(6);
    expect(heap.size()).toBe(5);
    expect(heap.extractMax()).toBe(5);
    expect(heap.extractMax()).toBe(4);
  });
  it('leetcode',()=> {
    const nums= [3,2,3,1,2,4,5,5,6,7,7,8,2,3,1,1,1,10,11,5,6,2,4,7,8,5,6];
    let k = 20
    const heap = new MaxHeap();
    for (let num of nums) {
      heap.add(num);
    }
    let index=0
    while (index< k-1) {
      const item = heap.extractMax();
      console.log('item',item)
      index++
    }
    expect( heap.extractMax()).toBe(2);
  })
});
