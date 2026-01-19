export function findKthLargest(nums: number[], k: number): number {
  function change(nums, i, j) {
    const temp = nums[i];
    nums[i] = nums[j];
    nums[j] = temp;
  }
  function quickSort(nums) {
    if (!nums.length) {
      return [];
    }

    let ret = nums.slice(0);
    let l = 0,
      r = ret.length,
      i = 0;
    while (l < r) {
      if (ret[l] < ret[i]) {
        change(ret, l, i);
        i = l;
        l++;
      } else if (ret[l] > ret[i]) {
        r--;
        if (r > l) {
          change(ret, r, l);
        }
      } else {
        l++;
      }
    }

    ret = [
      ...quickSort(ret.slice(0, i)),
      ...ret.slice(i, r),
      ...quickSort(ret.slice(r)),
    ];
    return ret;
  }
  nums = quickSort(nums);
  let count = 0;
  for (let i = nums.length - 1; i >= 0; i--) {
    count++;
    if (count === k) {
      return nums[i];
    }
  }
}
