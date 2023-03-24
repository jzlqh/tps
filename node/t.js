const str = 'a'

for (const i of str) {
  console.log('i.charCodeAt().toString(2)', i.charCodeAt().toString(2));
  console.log(i.charCodeAt().toString(2).length / 8);
}

console.log('i.charCodeAt().toString(2)', str.charCodeAt().toString(2).length / 8);