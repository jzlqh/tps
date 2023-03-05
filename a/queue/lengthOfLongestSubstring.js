let str = 'abcabcbb'
const lengthOfLongestSubstring = str => {
  const arr = []
  let max = 0
  let queue = []
  for (let i of str) {
    if (arr.includes(i)) {
      arr.splice(arr.indexOf(i), 1)
    }
    arr.push(i)
    queue = max > arr.length ? queue : arr
    max = Math.max(max, arr.length)
  }
  console.log('queue', queue)
  return max
}

console.log('lengthOfLongestSubstring', lengthOfLongestSubstring(str));