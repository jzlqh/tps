const nums = [1, 3, -1, -3, 5, 3, 6, 7]
const k = 3

const getMaxSlideWindow = (nums, k) => {
  const arr = []
  const result = []
  const queue = []
  for (let i = 0; i < nums.length; i++) {
    arr.push(nums[i])
    if (i >= k - 1) {
      console.log('arr', arr)
      result.push(Math.max(...arr))
      arr.shift()
    }
  }

  return result
}

console.log('getMaxSlideWindow', getMaxSlideWindow(nums, k));