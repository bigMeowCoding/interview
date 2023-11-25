export function instanceOf(obj, func) {
  if (!obj) {
    return false;
  }
  const proto = Object.getPrototypeOf(obj);
  if (proto === func.prototype) {
    return true;
  }
  return instanceOf(proto, func);
}
