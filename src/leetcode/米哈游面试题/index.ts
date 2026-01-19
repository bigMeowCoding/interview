// export function compute(num) {
//   if (num === 1 || num / 2 === 1) {
//     return 1;
//   }
//   const mode = num % 2;
//   return 1 + (mode === 0 ? compute(num / 2) : compute(num - 1));
// }


/**
 * 计算到一个数字最小要经历几次计算
 * 可以通过两种方式：1 加2.乘2
 * @param num number整型
 */
export function compute(num: number): number {
  if (num === 1 || num / 2 === 1) {
    return 1;
  }
  const mode = num % 2;
  return 1 + (mode === 0 ? compute(num / 2) : compute(num - 1));
}