export class ListNode<T> {
  value: T;
  next: ListNode<T> | null = null;
  prev: ListNode<T> | null = null;

  constructor(value: T) {
    this.value = value;
  }
}

export class Queue<T> {
  private head: ListNode<T> | null = null;
  private tail: ListNode<T> | null = null;
  private length = 0;

  enqueue(value: T) {
    const node = new ListNode(value);
    if (!this.head) {
      this.head = node;
      this.tail = node;
    } else {
      if (this.tail) {
        this.tail.next = node;
        node.prev = this.tail;
      }
      this.tail = node;
    }
    this.length += 1;
  }

  dequeue(): T | null {
    if (!this.head) {
      return null;
    }
    const value = this.head.value;
    this.head = this.head.next;
    if (this.head) {
      this.head.prev = null;
    } else {
      this.tail = null;
    }
    this.length -= 1;
    return value;
  }

  isEmpty() {
    return this.length === 0;
  }

  size() {
    return this.length;
  }

  toArray(): T[] {
    const result: T[] = [];
    let current = this.head;
    while (current) {
      result.push(current.value);
      current = current.next;
    }
    return result;
  }
}

export class Stack<T> {
  private top: ListNode<T> | null = null;
  private length = 0;

  push(value: T) {
    const node = new ListNode(value);
    node.next = this.top;
    if (this.top) {
      this.top.prev = node;
    }
    this.top = node;
    this.length += 1;
  }

  pop(): T | null {
    if (!this.top) {
      return null;
    }
    const value = this.top.value;
    this.top = this.top.next;
    if (this.top) {
      this.top.prev = null;
    }
    this.length -= 1;
    return value;
  }

  peek(): T | null {
    return this.top ? this.top.value : null;
  }

  isEmpty() {
    return this.length === 0;
  }

  size() {
    return this.length;
  }
}
