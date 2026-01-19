export function rob(nums: number[]): number {
  if (!nums.length) {
    return 0;
  }
  let prev = 0,
    pprev = 0,
    cur = 0,
    i = 0;

  while (i < nums.length) {
    cur = Math.max(prev, nums[i] + pprev);
    pprev = prev;
    i++;
    prev = cur;
  }
  return cur;
}
