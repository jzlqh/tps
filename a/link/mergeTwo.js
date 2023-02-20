const l1 = {
  val: 1,
  next: {
    val: 3,
    next: null
  }
}
const l2 = {
  val: 2,
  next: null
}

const mergeTwo = (l1, l2) => {
  if (!l1) return l2
  if (!l2) return l1
  if (l1.val < l2.val) {
    l1.next = mergeTwo(l1.next, l2)
    return l1
  } else {
    l2.next = mergeTwo(l1, l2.next)
    return l2
  }
}

let c = mergeTwo(l1, l2)
console.log('c', c);
while (c) {
  console.log('c', c.val)
  c = c.next
}