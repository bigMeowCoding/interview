export function flat(array, dept) {
  return array.reduce((acc, current) => {
    if (Array.isArray(current)) {
      if (dept === undefined || dept > 0) {
        acc = acc.concat(flat(current, dept ? dept - 1 : dept));
      } else {
        acc.push(current);
      }
    } else {
      acc.push(current);
    }
    return acc;
  }, []);
}
