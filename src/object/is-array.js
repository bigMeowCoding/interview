/**
 * 判断一个值是否为数组
 * @param {any} val
 * @returns {boolean}
 */
export function isArray(val) {
  return Object.prototype.toString.call(val) === "[object Array]";
}
