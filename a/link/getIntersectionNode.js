const linkCommon = {
  val: 5,
  next: null
}

const linkA = {
  val: 1,
  next: {
    val: 3,
    next: linkCommon
  }
}
const linkB = {
  val: 2,
  next: {
    val: 4,
    next: linkCommon
  }
}

const getInterSectionNode = (headA, headB) => {
  let pA = headA
  let pB = headB
  while (pA || pB) {
    if (pA === pB) return pA
    pA = pA ? pA.next : headB
    pB = pB ? pB.next : headA
  }
  return null
}

const c = getInterSectionNode(linkA, linkB)
console.log('c', c);

// while (c) {
//   console.log('c.val', c.val)
//   c = c.next
// }