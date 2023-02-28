
const num1 = [1, 2, 2, 1], num2 = [2, 2]

const intersection = (num1, num2) => {
  return [...new Set(num2.filter(ele => num1.includes(ele)))]
}

console.log(intersection(num1, num2));

