class GetMin {
  constructor() {
    this.min = -1
    this.stack = []
  }
  push(item) {
    if (!this.stack.length) this.min = item
    this.min = Math.min(item, this.min)
    this.stack.push(item)
  }
  pop() {
    this.stack.pop()
    this.min = Math.min(...this.stack)
  }
  peek() {
    if (!this.stack.length) return null
    return this.stack[this.stack.length - 1]
  }
  getMin() {
    console.log('this.min', this.min);
    return this.min
  }
}
const minStack = new GetMin();
minStack.push(-2);
minStack.push(0);
minStack.push(-3);
minStack.getMin();
minStack.pop();
const c = minStack.peek();
console.log('c', c)
minStack.getMin();