class TwoStack {
  constructor() {
    this.stack1 = []
    this.stack2 = []
  }
  en(item) {
    this.stack1.push(item)
  }
  de() {
    if (this.stack2.length) return this.stack2.pop()
    if (!this.stack1.length) return -1
    while (this.stack1.length) {
      const item = this.stack1.pop()
      this.stack2.push(item)
    }
    return this.stack2.pop()
  }
}

const c = new TwoStack()
c.en(1)
c.en(2)
c.en(3)
console.log('c.de', c.de());
console.log('c.de', c.de());
console.log('c.de', c.de());