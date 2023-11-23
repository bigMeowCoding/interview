export class MaxHeap {
  constructor() {
    this.stack = [];
  }
  add(item) {
    this.stack.push(item);
    this.bubbleUp(this.size() - 1);
  }

  extractMax() {
    const item = this.stack.shift();
    if (this.stack.length) {
      const lastItem = this.stack.pop();
      this.stack.unshift(lastItem);
      this.bubbleDown(0);
    }
    return item;
  }
  swift(i, j) {
    const temp = this.stack[i];
    this.stack[i] = this.stack[j];
    this.stack[j] = temp;
  }
  size() {
    return this.stack.length;
  }
  bubbleUp(index) {
    while (index >= 0) {
      const parentIndex = Math.floor((index - 1) / 2);
      if (parentIndex >= 0 && this.stack[parentIndex] < this.stack[index]) {
        this.swift(index, parentIndex);
        index = parentIndex;
      } else {
        break;
      }
    }
  }
  bubbleDown(index) {
    const len = this.size() - 1;
    while (index <= len) {
      const left = 2 * index + 1;
      const right = 2 * index + 2;
      let maxIndex = index;
      if (left <= len && this.stack[left] > this.stack[maxIndex]) {
        maxIndex = left;
      }
      if (right <= len && this.stack[right] > this.stack[maxIndex]) {
        maxIndex = right;
      }
      if (maxIndex !== index) {
        this.swift(maxIndex, index);
        index = maxIndex;
      } else {
        break;
      }
    }
  }
}
