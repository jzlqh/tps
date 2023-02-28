const str = '  hello world!  '
const reverse = str => {
  if (typeof str !== 'string') return
  return str.replace(/\s+/, ' ').split(' ').reverse(' ').join('  ')
}

console.log(reverse(str));