const nums = [2, 7, 11, 15], target = 9

const sum = (nums, target) => {
  let map = new Map()
  for (let i = 0; i < nums.length; i++) {
    const k = target - nums[i]
    if (map.has(k)) return [map.get(k), i]
    map.set(nums[i], i)
  }
}

console.log(sum(nums, target));