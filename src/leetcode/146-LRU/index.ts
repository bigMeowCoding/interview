export class LinkNode {
  key: number;
  value: number;
  prev: LinkNode | null = null;
  next: LinkNode | null = null;

  constructor(key: number, value: number) {
    this.key = key;
    this.value = value;
  }
}

export class LRUCache {
  private capacity = 0;
  private map = null;
  private head = null;
  private tail = null;

  constructor(capacity: number) {
    this.capacity = capacity;
    this.map = new Map<number, LinkNode>();
  }

  private moveToHead(node: LinkNode) {
    this.removeFromList(node);
    node.next = this.head;
    node.prev = null;
    if (this.head) {
      this.head.prev = node;
    }
    this.head = node;
    if (!this.tail) {
      this.tail = node;
    }
  }
  private addToHead(node: LinkNode) {
    node.prev = null;
    node.next = this.head;
    if (this.head) {
      this.head.prev = node;
    }
    this.head = node;
    if (!this.tail) {
      this.tail = node;
    }
  }
  private removeLRUItem() {
    const lastItem = this.tail.key;
    this.map.delete(lastItem);
    this.removeFromList(this.tail);
  }

  private removeFromList(node: LinkNode) {
    if (node.prev) {
      node.prev.next = node.next;
    } else {
      this.head = node.next;
    }

    if (node.next) {
      node.next.prev = node.prev;
    } else {
      this.tail = node.prev;
    }
  }

  get(key: number): number {
    if (this.map.has(key)) {
      const node = this.map.get(key);
      const value = node.value;
      this.moveToHead(node);
      return value;
    } else {
      return -1;
    }
  }

  put(key: number, value: number): void {
    if (this.map.has(key)) {
      const node = this.map.get(key);
      node.value = value;
      this.moveToHead(node);
    } else {
      const node = new LinkNode(key, value);
      this.addToHead(node);
      this.map.set(key, node);
      if (this.map.size > this.capacity) {
        this.removeLRUItem();
      }
    }
  }
}

/**
 * Your LRUCache object will be instantiated and called as such:
 * var obj = new LRUCache(capacity)
 * var param_1 = obj.get(key)
 * obj.put(key,value)
 */
