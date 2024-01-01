// Fake: Array.prototype.flat
export function flat(array, dept) {
  let result = [];
  array.forEach((item) => {
    if (Array.isArray(item)) {
      if (dept > 1) {
        result = result.concat(flat(item, dept - 1));
      } else {
        result = result.concat(item);
      }
    } else {
      result.push(item);
    
    }
  });
  return result;
}
