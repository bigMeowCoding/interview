export function deepClone(params, map = new WeakMap()) {
  function forEach(array, iterator) {
    let index = 0;
    while (index < array.length) {
      iterator(array[index], index);
      index++;
    }
  }

  if (typeof params === "object") {
    if (map.has(params)) {
      return map.get(params);
    }
    let obj = Array.isArray(params) ? [] : {};
    map.set(params, obj);
    const keys = Array.isArray(params) ? void 0 : Object.keys(params);
    forEach(keys || params, (key, index) => {
      if (!keys) {
        key = index;
      }
      obj[key] = deepClone(params[key], map);
    });
    return obj;
  } else {
    return params;
  }
}
