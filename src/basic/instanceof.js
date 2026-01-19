export function instanceOf(obj, func) {
  if (
    obj === null ||
    obj === undefined ||
    typeof obj !== "object" ||
    typeof func !== "function"
  ) {
    return false;
  }
  const prototype = func.prototype;
  let proto = Object.getPrototypeOf(obj);
  while (proto !== null) {
    if (proto === prototype) {
      return true;
    }
    proto = Object.getPrototypeOf(proto);
  }
  return false;
}
