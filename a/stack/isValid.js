const isValid = (str) => {
  let map = {
    '{': '}',
    '(': ')',
    '[': ']'
  }
  let stack = []
  for (let i = 0; i < str.length; i++) {
    if (map[str[i]]) {
      stack.push(map[str[i]])
    } else if (stack.pop() !== str[i]) {
      return false
    }
  }
  return stack.length === 0
}

console.log(isValid('{{}}'));