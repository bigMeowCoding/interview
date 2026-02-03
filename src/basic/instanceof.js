export function instanceOf(obj, func) {
  if (
    obj === null ||
    obj === undefined ||
    typeof func !== "function" ||
    typeof obj !== "object"
  ) {
    return false;
  }
  let proto = Object.getPrototypeOf(obj);
  const prototype = func.prototype;
  while (proto) {
    if (proto === prototype) {
      return true;
    }
    proto = Object.getPrototypeOf(proto);
  }
  return false;
}
