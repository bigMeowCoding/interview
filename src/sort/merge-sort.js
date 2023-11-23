export function mergeSort(nums) {
  if (nums.length <= 1) {
    return nums;
  }
  const half = Math.floor(nums.length / 2);
  let left = mergeSort(nums.slice(0, half));
  let right = mergeSort(nums.slice(half));
  function mergeSortAray(nums1, nums2) {
    let len1 = nums1.length,
      len2 = nums2.length;
    let i = len2 + len1 - 1,
      l = len1 - 1,
      r = len2 - 1;
    while (i >= 0) {
      if (l < 0 || nums2[r] > nums1[l]) {
        nums1[i] = nums2[r];
        r--;
      } else {
        nums1[i] = nums1[l];
        l--;
      }
      i--;
    }
    return nums1;
  }
  return mergeSortAray(left, right);
}
