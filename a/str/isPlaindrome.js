const str = 'abcba'
const isPlaindRome = str => {
  return str.split('').reverse('').join('') === str
}

console.log(isPlaindRome(str));