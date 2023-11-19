export function deepClone(params, map = new WeakMap()) {
  function forEach(array, iterator) {
    let index = 0;
    while (index < array.length) {
      iterator(array[index], index);
    }
  }

  if (typeof params === "Object") {
    if (map.has(params)) {
      return map.get(params);
    }
    let obj = Array.isArray(params) ? [] : {};
    map.set(params, obj);
    const keys = Array.isArray(obj) ? obj : Object.keys(obj);
    forEach(keys, (key, index) => {
      obj[key] = deepClone(params[key], map);
    });
    return obj;
  } else {
    return params;
  }
}
