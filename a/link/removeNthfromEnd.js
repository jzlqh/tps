const link = {
  val: 1,
  next: {
    val: 2,
    next: {
      val: 3,
      next: {
        val: 4,
        next: null
      }
    }
  }
}

const removeNthFromEnd = function (head, n) {
  let fast = head, slow = head
  // 快先走 n 步
  while (n--) {
    fast = fast.next
  }

  // fast、slow 一起前进
  while (fast && fast.next) {
    fast = fast.next
    slow = slow.next
  }
  slow.next = slow.next.next
  return head
};

const c = removeNthFromEnd(link, 2)
console.log('c', c);

removeNthFromEdn(link, 2)


