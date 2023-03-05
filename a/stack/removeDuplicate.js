let str = 'abbaca'

const removeDuplicate = str => {
  let stack = []
  for (let i of str) {
    const item = stack.pop()
    if (item !== i) {
      stack.push(item)
      stack.push(i)
    }
  }
  return stack.join('')

}

console.log(removeDuplicate(str));


