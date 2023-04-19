const str = 'abaccdeff'

const firstUniqChar = str => {
  const map = new Map()
  for (let i of str) {
    if (map.has(i)) {
      map.set(i, map.get(i) + 1)
    } else {
      map.set(i, 1)
    }
  }
  console.log('map', map)
  for (let j of map.keys()) {
    if (map.get(j) === 1) {
      return j
    }
  }
  return ''
}

console.log('firstUniqChar', firstUniqChar(str));

