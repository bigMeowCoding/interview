import { describe, it, expect } from "vitest";
import { MaxHeap } from "./max-heap";

describe("MaxHeap", () => {
  describe("insert", () => {
    it("insert single element", () => {
      const heap = new MaxHeap();
      heap.insert(5);
      expect(heap.size()).toBe(1);
      expect(heap.heap[0]).toBe(5);
    });

    it("insert multiple elements maintains max heap property", () => {
      const heap = new MaxHeap();
      [10, 5, 15, 20, 8].forEach((v) => heap.insert(v));
      expect(heap.heap[0]).toBe(20);
    });

    it("insert duplicate values", () => {
      const heap = new MaxHeap();
      [5, 5, 5].forEach((v) => heap.insert(v));
      expect(heap.size()).toBe(3);
      expect(heap.heap[0]).toBe(5);
    });

    it("insert negative values", () => {
      const heap = new MaxHeap();
      [-5, -10, -3].forEach((v) => heap.insert(v));
      expect(heap.heap[0]).toBe(-3);
    });

    it("insert mix of positive and negative", () => {
      const heap = new MaxHeap();
      [-1, 5, -10, 3, 0].forEach((v) => heap.insert(v));
      expect(heap.heap[0]).toBe(5);
    });
  });

  describe("pop", () => {
    it("pop from empty heap returns null", () => {
      const heap = new MaxHeap();
      expect(heap.pop()).toBe(null);
    });

    it("pop single element", () => {
      const heap = new MaxHeap();
      heap.insert(42);
      expect(heap.pop()).toBe(42);
      expect(heap.size()).toBe(0);
    });

    it("pop maintains max heap property", () => {
      const heap = new MaxHeap();
      [10, 5, 15, 20, 8].forEach((v) => heap.insert(v));
      expect(heap.pop()).toBe(20);
      expect(heap.pop()).toBe(15);
      expect(heap.pop()).toBe(10);
      expect(heap.pop()).toBe(8);
      expect(heap.pop()).toBe(5);
      expect(heap.size()).toBe(0);
    });

    it("pop after multiple inserts", () => {
      const heap = new MaxHeap();
      [1, 2, 3, 4, 5].forEach((v) => heap.insert(v));
      expect(heap.pop()).toBe(5);
      heap.insert(6);
      expect(heap.pop()).toBe(6);
    });

    it("pop all elements in sorted descending order", () => {
      const heap = new MaxHeap();
      const arr = [3, 1, 6, 2, 7, 4, 8, 5];
      arr.forEach((v) => heap.insert(v));
      const result = [];
      while (heap.size() > 0) {
        result.push(heap.pop());
      }
      expect(result).toEqual([8, 7, 6, 5, 4, 3, 2, 1]);
    });
  });

  describe("size", () => {
    it("size of empty heap is 0", () => {
      const heap = new MaxHeap();
      expect(heap.size()).toBe(0);
    });

    it("size updates after insert and pop", () => {
      const heap = new MaxHeap();
      expect(heap.size()).toBe(0);
      heap.insert(1);
      expect(heap.size()).toBe(1);
      heap.insert(2);
      expect(heap.size()).toBe(2);
      heap.pop();
      expect(heap.size()).toBe(1);
      heap.pop();
      expect(heap.size()).toBe(0);
    });
  });

  describe("heap property", () => {
    it("largest element always at root after insert", () => {
      const heap = new MaxHeap();
      [1, 3, 5, 7, 9, 2, 4, 6, 8].forEach((v) => heap.insert(v));
      expect(heap.heap[0]).toBe(9);
    });

    it("heap property preserved after shiftDown", () => {
      const heap = new MaxHeap();
      [20, 10, 15, 8, 5, 12].forEach((v) => heap.insert(v));
      heap.pop();
      const checkMaxHeap = (arr, i) => {
        if (i >= arr.length) return true;
        const left = 2 * i + 1;
        const right = 2 * i + 2;
        if (left < arr.length && arr[left] > arr[i]) return false;
        if (right < arr.length && arr[right] > arr[i]) return false;
        return checkMaxHeap(arr, left) && checkMaxHeap(arr, right);
      };
      expect(checkMaxHeap(heap.heap, 0)).toBe(true);
    });
  });

  describe("boundary cases", () => {
    it("large values", () => {
      const heap = new MaxHeap();
      heap.insert(Number.MAX_SAFE_INTEGER);
      expect(heap.pop()).toBe(Number.MAX_SAFE_INTEGER);
    });

    it("repeated insert and pop", () => {
      const heap = new MaxHeap();
      for (let i = 0; i < 100; i++) {
        heap.insert(i);
        if (i % 2 === 0) {
          heap.pop();
        }
      }
      expect(heap.size()).toBe(50);
    });
  });
});
