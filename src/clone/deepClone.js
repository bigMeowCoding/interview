const objTag = "[object Object]",
  arrayTag = "[object Array]",
  mapTag = "[object Map]",
  setTag = "[object Set]";
export function deepClone(params, map = new WeakMap()) {
  const deepTags = [objTag, arrayTag, mapTag, setTag];
  function forEach(array, iterator) {
    let index = 0;
    while (index < array.length) {
      iterator(array[index], index);
      index++;
    }
  }

  function isObject(value) {
    const type = typeof value;
    return value !== null && (type === "object" || type === "function");
  }
  function getType(value) {
    return Object.prototype.toString.call(value);
  }
  function getInit(target) {
    const ctor = target.constructor;
    return new ctor();
  }
  if (!isObject(params)) {
    return params;
  }
  const type = getType(params);
  console.log(type, "ttt");
  if (map.has(params)) {
    return map.get(params);
  }
  let obj = null;
  if (deepTags.includes(type)) {
    obj = getInit(params);
  }

  map.set(params, obj);
  if (type === setTag) {
    params.forEach((item) => {
      obj.add(item);
    });
    return obj;
  }
  if (type === mapTag) {
    params.forEach((item, key) => {
      obj.set(key, item);
    });
    return obj;
  }
  const keys = Array.isArray(params) ? void 0 : Object.keys(params);
  forEach(keys || params, (key, index) => {
    if (!keys) {
      key = index;
    }
    obj[key] = deepClone(params[key], map);
  });
  return obj;
}
