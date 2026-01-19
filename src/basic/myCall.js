function customCall(fn, thisArg, ...args) {
  if (thisArg === null || thisArg === undefined) {
    thisArg = globalThis;
  }
  const key = Symbol("key");
  thisArg[key] = fn;
  const result = thisArg[key](...args);
  delete thisArg[key];
  return result;
}
export default customCall;
