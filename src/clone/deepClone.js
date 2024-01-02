function isObject(value) {
  return value != null && typeof value === "object";
}
function getType(value) {
  return Object.prototype.toString.apply(value, []);
}
const TYPE = {
  number: "[object Number]",
  string: "[object String]",
  boolean: "[object Boolean]",
  date: "[object Date]",
  regexp: "[object RegExp]",
  map: "[object Map]",
  set: "[object Set]",
  array: "[object Array]",
  object: "[object Object]",
};
export function deepClone(value, map = new WeakMap()) {
  function init(type) {
    switch (type) {
      case TYPE.boolean:
        return new value.constructor(value.valueOf());
      case TYPE.number:
      case TYPE.string:
        return new value.constructor(value);
      case TYPE.regexp:
        return new RegExp(value.source, value.flags);
      case TYPE.date:
        return new Date(value.getTime());
      case TYPE.map:
        return new Map();
      case TYPE.set:
        return new Set();
      case TYPE.array:
        return [];
      default:
        return {};
    }
  }
  const canIterType = [TYPE.map, TYPE.array, TYPE.set, TYPE.object];
  if (isObject(value)) {
    const type = getType(value);
    const cloneObj = init(type);
    if (map.has(value)) {
      return map.get(value);
    }
    map.set(value, cloneObj);
    if (canIterType.includes(type)) {
      if (type === TYPE.set) {
        for (const item of value) {
          cloneObj.add(deepClone(item, map));
        }
      } else if (type === TYPE.map) {
        for (const [key, item] of value) {
          cloneObj.set(key, deepClone(item, map));
        }
      } else if (type === TYPE.array) {
        value.forEach((item) => {
          cloneObj.push(deepClone(item, map));
        });
      } else {
        const keys = Object.keys(value);
        for (const key of keys) {
          cloneObj[key] = deepClone(value[key], map);
        }
      }
    }
    return cloneObj;
  } else {
    return value;
  }
}
