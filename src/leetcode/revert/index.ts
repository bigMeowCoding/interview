export function revertNumber(num) {
  const stack = [];
  const negative = num < 0;
  if (negative) {
    num = num * -1;
  }
  while (num > 10) {
    let remain = num % 10;
    num = Math.floor(num / 10);

    stack.push(remain);
  }
  stack.push(num);
  const ret = parseInt(stack.join(""));
  return negative ? -1 * ret : ret;
}
