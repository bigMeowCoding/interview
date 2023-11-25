export function mockNew(fun, ...args) {
  const newObj = Object.create(fun.prototype);
  const ret = fun.apply(newObj, args);
  return typeof ret === "object" ? ret : newObj;
}
