const link = require('./val')

const findMiddle = head => {
  let fast = head
  let slow = head
  while (fast && fast.next) {
    fast = fast.next.next
    slow = slow.next
  }
  return slow
}

const c = findMiddle(link)
console.log('findMiddle', c);
// /card/apply

// 175

bycard - web - translation