function isObj(obj) {
  return typeof obj === "object" && obj !== null;
}
export function flatten(obj, parentKey = "", result = {}) {
  if (Array.isArray(obj)) {
    obj.forEach((value, key) => {
      const newKey = parentKey ? `${parentKey}[${key}]` : key;
      flatten(value, newKey, result);
    });
  } else if (isObj(obj)) {
    for (let [key, value] of Object.entries(obj)) {
      const newKey = parentKey ? `${parentKey}.${key}` : key;
      flatten(value, newKey, result);
    }
  } else {
    result[parentKey] = obj;
  }
  return result;
}
const obj = {
  a: {
    b: 1,
    c: 2,
    d: { e: 5 },
  },
  b: [1, 3, { a: 2, b: 3 }],
  c: 3,
};

console.log(flatten(obj));
