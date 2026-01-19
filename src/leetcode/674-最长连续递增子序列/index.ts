export function findLengthOfLCIS(nums: number[]): number {
  let l = 0,
    r = l,
    len = 0;

  while (r < nums.length) {
    if (l == r || nums[r - 1] < nums[r]) {
      len = Math.max(len, r - l + 1);
      r++;
    } else {
      l = r;
    }
  }
  return len;
}
