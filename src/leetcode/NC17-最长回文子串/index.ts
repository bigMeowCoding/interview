/**
 * 代码中的类名、方法名、参数名已经指定，请勿修改，直接返回方法规定的值即可
 *
 *
 * @param A string字符串
 * @return int整型
 */
export function getLongestPalindrome(s: string): number {
  let len = 0;
  function findPalindromeLen(str, l, r) {
    let ret = 0;
    while (l >= 0 && r < str.length && str[l] === str[r]) {
      ret = r - l + 1;
      l--;
      r++;
    }
    return ret;
  }

  for (let i = 0; i < s.length; i++) {
    const len1 = findPalindromeLen(s, i, i);
    const len2 = findPalindromeLen(s, i, i + 1);
    len = Math.max(len2, len1, len);
  }
  return len;
}
