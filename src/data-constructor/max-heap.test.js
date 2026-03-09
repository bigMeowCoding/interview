import { describe, it, expect } from "vitest";
import { MaxHeap } from "./max-heap.js";

describe("MaxHeap", () => {
  it("should return correct size", () => {
    const heap = new MaxHeap();
    expect(heap.size()).toBe(0);
    heap.insert(1);
    expect(heap.size()).toBe(1);
    heap.insert(2);
    expect(heap.size()).toBe(2);
  });

  it("should return null when pop empty heap", () => {
    const heap = new MaxHeap();
    expect(heap.pop()).toBe(null);
  });

  it("should pop max element", () => {
    const heap = new MaxHeap();
    heap.insert(3);
    heap.insert(1);
    heap.insert(2);
    expect(heap.pop()).toBe(3);
  });

  it("should maintain max heap property", () => {
    const heap = new MaxHeap();
    heap.insert(5);
    heap.insert(3);
    heap.insert(8);
    heap.insert(1);
    heap.insert(9);
    expect(heap.pop()).toBe(9);
    expect(heap.pop()).toBe(8);
    expect(heap.pop()).toBe(5);
    expect(heap.pop()).toBe(3);
    expect(heap.pop()).toBe(1);
  });

  it("should handle single element", () => {
    const heap = new MaxHeap();
    heap.insert(42);
    expect(heap.pop()).toBe(42);
    expect(heap.size()).toBe(0);
  });
});
