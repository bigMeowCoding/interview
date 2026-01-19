export function longestPalindrome(s: string): string {
  let l = 0,
    r = l,
    len = 0;

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

    const longest = Math.max(len2, len1);
    if (longest > len) {
      len = longest;
      l = i - Math.floor((longest - 1) / 2);
      r = i + Math.floor(longest / 2);
    }
  }
  return s.slice(l, r + 1);
}
