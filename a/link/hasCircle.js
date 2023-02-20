const l3 = {
  value: 3,
  next: null
}

const l2 = {
  value: 2,
  next: null
}

const l1 = {
  value: 1,
  next: null
}

l1.next = l2
l2.next = l3
l3.next = l1

const hasCircle = head => {
  while (head) {
    if (head.flag) true
    head.flag = true
    head = head.next
  }
  return false
}

const c = hasCircle(l1)
console.log('hasCircle', c);