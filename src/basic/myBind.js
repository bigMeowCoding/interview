function myBind(fn, context, ...args) {
  const boundFn = function (...callArgs) {
    const isNew = this instanceof boundFn;
    let finalContext = isNew
      ? this
      : context === null || context === undefined
      ? globalThis
      : context;

    const funKey = Symbol("key");
    finalContext[funKey] = fn;
    const result = finalContext[funKey](...args, ...callArgs);
    delete finalContext[funKey];

    if (
      isNew &&
      result &&
      (typeof result === "object" || typeof result === "function")
    ) {
      return result;
    }
    return isNew ? this : result;
  };
  if (fn.prototype) {
    boundFn.prototype = Object.create(fn.prototype);
  }
  Object.defineProperty(boundFn, "name", {
    value: "bound " + fn.name,
    writable: false,
    enumerable: false,
    configurable: true,
  });
  return boundFn;
}
export default myBind;
