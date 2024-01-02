function isObj(obj) {
  return typeof obj === "object" && obj !== null;
}
export function flatten(obj, parentKey = "", result = {}) {
  if (isObj(obj)) {
    const keys = Object.keys(obj);
    let newKey = "";
    for (const key of keys) {
      if (Array.isArray(obj)) {
        newKey = parentKey ? `${parentKey}[${key}]` : key;
      } else {
        newKey = parentKey ? `${parentKey}.${key}` : key;
      }
       flatten(obj[key],newKey,result)
    }
  } else {
    if (parentKey) {
      result[parentKey] = obj;
    }
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
