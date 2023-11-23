function isObject(value) {
  return value != null && typeof value === "object";
}
function getType(value) {
  return Object.prototype.toString.call(value);
}
const TAG = {
  map: "[object Map]",
  set: "[object Set]",
  array: "[object Array]",
  obj: "[object Object]",
  num: "[object Number]",
  str: "[object String]",
  boolean: "[object Boolean]",
  regex: "[object RegExp]",
  date: "[object Date]",
  error:"[object Error]"
};
const canIterationTag = [TAG.set, TAG.map, TAG.array, TAG.obj];
export function deepClone(value, map = new WeakMap()) {
  function init(tag) {
    switch (tag) {
      case TAG.num:
      case TAG.str:
      case TAG.boolean:
        return new value.constructor(value.valueOf());
      case TAG.date:
        return new value.constructor(value.getTime());
      case TAG.error:
        return new value.constructor(value);
      case TAG.map:
      case TAG.set:
      case TAG.array:
        return new value.constructor();
      case TAG.regex:
        return new value.constructor(value.source, value.flags);
      default:
        return {};
    }
  }

  if (isObject(value)) {
    const type = getType(value);
    console.log(type, "type");
    if (map.has(value)) {
      return map.get(value);
    }
    const tag = getType(value);
    const obj = init(tag);
    map.set(value, obj);

    if (canIterationTag.includes(tag)) {
      if (tag === TAG.set) {
        const values = value.values();
        for (let value of values) {
          obj.add(deepClone(value, map));
        }
      } else if (tag === TAG.map) {
        const keys = value.keys();
        console.log("keys===", keys);
        for (let key of keys) {
          console.log("key", key, value.get(key));
          obj.set(key, deepClone(value.get(key), map));
        }
      } else {
        const keys = Object.keys(value);
        for (let key of keys) {
          obj[key] = deepClone(value[key], map);
        }
      }
    }


    return obj;
  } else {
    return value;
  }
}
