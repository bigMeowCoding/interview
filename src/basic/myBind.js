function myBind(fn, thisArg, ...defaultArgs) {
  function _bind(...args) {
    const isNew = this instanceof _bind;
    const context = isNew ? this : thisArg ? thisArg : globalThis;
    const key = Symbol("key");
    context[key] = fn;
    const ret = context[key](...defaultArgs, ...args);
    delete context[key];
    return isNew ? (ret && typeof ret === "object" ? ret : context) : ret;
  }
  _bind.prototype = Object.create(fn.prototype);
  Object.defineProperty(_bind, "name", {
    value: "bound " + fn.name,
    writable: false,
    enumerable: false,
    configurable: true,
  });
  return _bind;
}

export default myBind;
