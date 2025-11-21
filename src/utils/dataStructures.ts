export class ListNode<T> {
  value: T;
  next: ListNode<T> | null = null;
  prev: ListNode<T> | null = null;

  constructor(value: T) {
    this.value = value;
  }
}

/**
 * Lista simplemente enlazada ligera. Se usa como base para las demás estructuras.
 */
export class SinglyLinkedList<T> {
  private head: ListNode<T> | null = null;
  private tail: ListNode<T> | null = null;
  private length = 0;

  append(value: T) {
    const node = new ListNode(value);
    if (!this.head) {
      this.head = node;
      this.tail = node;
    } else {
      this.tail!.next = node;
      this.tail = node;
    }
    this.length += 1;
  }

  prepend(value: T) {
    const node = new ListNode(value);
    node.next = this.head;
    this.head = node;
    if (!this.tail) {
      this.tail = node;
    }
    this.length += 1;
  }

  insertAt(value: T, index: number) {
    if (index < 0 || index > this.length) {
      throw new RangeError("Index out of bounds");
    }
    if (index === 0) {
      this.prepend(value);
      return;
    }
    if (index === this.length) {
      this.append(value);
      return;
    }
    let current = this.head;
    for (let i = 0; i < index - 1 && current; i++) {
      current = current.next;
    }
    if (!current) {
      throw new RangeError("Index out of bounds");
    }
    const node = new ListNode(value);
    node.next = current.next;
    current.next = node;
    this.length += 1;
  }

  removeAt(index: number): T | null {
    if (index < 0 || index >= this.length || !this.head) {
      return null;
    }
    if (index === 0) {
      const value = this.head.value;
      this.head = this.head.next;
      if (!this.head) {
        this.tail = null;
      }
      this.length -= 1;
      return value;
    }
    let current = this.head;
    for (let i = 0; i < index - 1 && current.next; i++) {
      current = current.next;
    }
    const node = current.next;
    if (!node) {
      return null;
    }
    current.next = node.next;
    if (node === this.tail) {
      this.tail = current;
    }
    this.length -= 1;
    return node.value;
  }

  find(predicate: (value: T) => boolean): T | null {
    let current = this.head;
    while (current) {
      if (predicate(current.value)) {
        return current.value;
      }
      current = current.next;
    }
    return null;
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

  isEmpty() {
    return this.length === 0;
  }

  size() {
    return this.length;
  }

  clear() {
    this.head = null;
    this.tail = null;
    this.length = 0;
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
