const str = 'deeedbbcccbdaa'
const k = '3'
const removeDuplicates = str => {
  const stack = []
  for (let i of str) {
    const pre = stack.pop()
    if (!pre || pre[0] !== i) {
      stack.push(pre)
      stack.push(i)
    } else if (pre.length < k - 1) {
      stack.push(pre + i)
    }
  }
  return stack
}

console.log(removeDuplicates(str, k));
