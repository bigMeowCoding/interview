/**
 * 将嵌套数组打平为一维数组
 * @param {any[]} arr 待打平的数组
 * @param {number} depth 打平深度，默认 Infinity
 * @returns {any[]} 打平后的一维数组
 */
export function flatArray(arr, depth = Infinity) {
  if (!Array.isArray(arr)) {
    throw new TypeError("Expected an array");
  }
  const result = [];
  for (const item of arr) {
    if (Array.isArray(item) && depth > 0) {
      result.push(...flatArray(item, depth - 1));
    } else {
      result.push(item);
    }
  }
  return result;
}
