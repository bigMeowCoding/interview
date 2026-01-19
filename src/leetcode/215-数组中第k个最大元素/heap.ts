class MinHeap {
  private heap: any[] = [];
  constructor() {
    this.heap = [];
  }
  insert(value) {
    this.heap.push(value);
    this.bubbleUp();
  }
  bubbleDown() {
    let index = 0;
    const heapLen = this.heap.length;

    while (true) {
      let smallestIndex = index;
      const leftChildIndex = 2 * index + 1;
      const rightChildIndex = 2 * index + 2;

      if (
        leftChildIndex < heapLen &&
        this.heap[leftChildIndex] < this.heap[smallestIndex]
      ) {
        smallestIndex = leftChildIndex;
      }

      if (
        rightChildIndex < heapLen &&
        this.heap[rightChildIndex] < this.heap[smallestIndex]
      ) {
        smallestIndex = rightChildIndex;
      }
      if (smallestIndex === index) {
        break;
      }
      this.shift(smallestIndex, index);
      index = smallestIndex;
    }
  }
  isEmpty() {
    return !this.heap.length;
  }
  size() {
    return this.heap.length;
  }
  extractMin() {
    if (this.isEmpty()) {
      return null;
    }
    if (this.heap.length === 1) {
      return this.heap.pop();
    }
    const min = this.heap[0];
    this.heap[0] = this.heap.pop();
    this.bubbleDown();
    return min;
  }
  bubbleUp() {
    let index = this.heap.length - 1;
    while (index > 0) {
      const parentIndex = Math.floor((index - 1) / 2);
      if (this.heap[parentIndex] > this.heap[index]) {
        this.shift(parentIndex, index);
        index = parentIndex;
      } else {
        break;
      }
    }
  }

  shift(parentIndex, index) {
    const temp = this.heap[parentIndex];
    this.heap[parentIndex] = this.heap[index];
    this.heap[index] = temp;
  }
}

export function findKthLargest(nums: number[], k: number): number {
  const heap = new MinHeap();
  for (let num of nums) {
    heap.insert(num);
  }
  while (heap.size() > k) {
    heap.extractMin();
  }
  return heap.extractMin();
}
