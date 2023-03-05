class RandomSet {
  constructor() {
    this.set = new Set()
  }
  add(ele) {
    if (this.set.has(ele)) return false
    this.set.add(ele)
    return true
  }
  remove(ele) {
    if (!this.set.has(ele)) return false
    this.set.delete(ele)
    return true
  }
  log() {
    const random = parseInt(Math.random() * this.set.size)
    console.log([...this.set][random])
  }
}

const c = new RandomSet()
c.add(1)
c.add(2)
c.add(3)
c.remove(2)
c.log()