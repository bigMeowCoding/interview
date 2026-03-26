var threeSum = function (nums) {
  const ret = [];
  nums.sort((a, b) => a - b);

  for (let i = 0; i < nums.length; i++) {
    if (nums[i] > 0) break; // 最小数已为正，后续不可能和为 0
    if (i > 0 && nums[i] === nums[i - 1]) continue;

    let j = i + 1;
    let k = nums.length - 1;

    while (j < k) {
      const sum = nums[i] + nums[j] + nums[k];
      if (sum === 0) {
        ret.push([nums[i], nums[j], nums[k]]);
        j++;
        k--;
        while (j < k && nums[j] === nums[j - 1]) j++;
        while (j < k && nums[k] === nums[k + 1]) k--;
      } else if (sum > 0) {
        k--;
      } else {
        j++;
      }
    }
  }
  return ret;
};
