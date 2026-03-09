export class MaxHeap {
  constructor() {
    this.heap = [];
  }
  size() {
    return this.heap.length;
  }
  getParentIndex(index) {
    return Math.floor((index - 1) / 2);
  }
  getLeftChildIndex(index) {
    return 2 * index + 1;
  }
  getRightChildIndex(index) {
    return 2 * index + 2;
  }
  swap(i, j) {
    return ([this.heap[i], this.heap[j]] = [this.heap[j], this.heap[i]]);
  }

  insert(val) {
    this.heap.push(val);
    this.shiftUp(this.heap[this.size() - 1]);
  }
  pop() {
    if (this.size() === 0) return null;
    const top = this.heap[0];

    if (this.size() === 1) {
      return top;
    }
    this.swap(0, this.size() - 1);
    this.shiftDown(0);
  }
  shiftUp(index) {
    while (index > 0) {
      let parentIndex = this.getParentIndex(index);
      if (this.heap[parentIndex] < this.heap[index]) {
        this.swap(index, parentIndex);
        index = parentIndex;
      } else {
        break;
      }
    }
  }
  shiftDown(index) {
    while (true) {
      let biggestIndex = index;
      let leftChildIndex = this.getLeftChildIndex(index);
      if (this.heap[leftChildIndex] > this.heap[biggestIndex]) {
        biggestIndex = leftChildIndex;
      }
      let rightChildIndex = this.getRightChildIndex(index);
      if (this.heap[rightChildIndex] > this.heap[biggestIndex]) {
        biggestIndex = rightChildIndex;
      }
      if (biggestIndex === index) {
        break;
      } else {
        if (biggestIndex === leftChildIndex) {
          this.swap(index, leftChildIndex);
          index = leftChildIndex;
        } else {
          this.swap(index, rightChildIndex);
          index = rightChildIndex;
        }
      }
    }
  }
}
