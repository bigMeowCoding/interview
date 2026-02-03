export default function customNew(fn, ...args) {
  const newObject = Object.create(fn.prototype);
  const result = fn.call(newObject, ...args);
  return result && typeof result === "object" ? result : newObject;
}
