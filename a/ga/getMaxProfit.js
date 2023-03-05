const arr = [7, 1, 5, 3, 6, 4]
const getMaxProfit = arr => {
  let profit = 0
  for (let i = 0; i < arr.length - 1; i++) {
    if (arr[i + 1] > arr[i]) {
      profit += arr[i + 1] - arr[i]
    }
  }
  return profit
}
console.log(getMaxProfit(arr));