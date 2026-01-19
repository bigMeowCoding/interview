export function climbStairs(n: number) {
  let i = 1;
  let p = 0,
    c = 1;
  while (i <= n) {
    const temp = c;
    c = p + c;
    p = temp;
    i++;
  }
  return c;
}
