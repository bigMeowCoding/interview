export function quickSort(nums) {
  if (nums.length <= 1) {
    return nums;
  }
  function swift(i, j) {
    let temp = nums[i];
    nums[i] = nums[j];
    nums[j] = temp;
  }

  let l = -1,
    r = nums.length,
    i = 0,
    temp = nums[i];
  while (i < r) {
    if (nums[i] < temp) {
      l++;
      i++;
    } else {
      r--;
      swift(i, r);
    }
  }
  let left = [],
    right = [];
  if (l >= 0) {
    left = quickSort(nums.slice(0, l + 1));
  }
  if (r <= nums.length - 1) {
    right = quickSort(nums.slice(r));
  }
  return left.concat(right);
}
