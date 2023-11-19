export function flat(array) {
  let ret = [];
  for (let item of array) {
    if (Array.isArray(item)) {
      ret = ret.concat(flat(item));
    } else {
      ret.push(item);
    }
  }
  return ret;
}
