const link = require('./val')

const print = head => {
  const collect = []
  while (head) {
    collect.push(head.val)
    head = head.next
  }
  return collect
}

const c = print(link)
console.log('print', c);

