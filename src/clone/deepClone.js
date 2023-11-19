const objTag = "[object Object]",
  arrayTag = "[object Array]",
  mapTag = "[object Map]",
  setTag = "[object Set]",
  numberTag = "[object Number]",
  stringTag = "[object String]",
  booleanTag = "[object Boolean]",
  dateTag = "[object Date]",
  errorTag = "[object Error]",
  regexpTag = "[object RegExp]",
  symbolTag = "[object Symbol]";

function copySymbol(target) {
  return undefined;
}

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

  function copyRegexTag(target) {
    const ctor = target.constructor;
    const reFlags = /\W*$/;
    const source = target.source;
    // const flag = reFlags.exec(target.source);
    console.log("reflag", target.flags);
    return new ctor(source, target.flags);
  }

  function getOtherTypeInit(target, type) {
    const ctor = target.constructor;
    switch (type) {
      case numberTag:
      case stringTag:
      case errorTag:
      case dateTag:
        return new ctor(target);
      case booleanTag:
        return new ctor(target.valueOf());

      case regexpTag:
        return copyRegexTag(target);

      default:
        return null;
    }
  }

  if (!isObject(params)) {
    return params;
  }
  const type = getType(params);
  if (map.has(params)) {
    return map.get(params);
  }
  let obj = null;
  if (deepTags.includes(type)) {
    obj = getInit(params);
  } else {
    obj = getOtherTypeInit(params, type);
    return obj;
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
