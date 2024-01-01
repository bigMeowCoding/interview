// Fake: Array.prototype.flat
export function flat(array, dept) {
  return array.reduce((a, b) => {
    if (Array.isArray(b) && (dept == null || dept > 0)) {
      return a.concat(flat(b, dept == null ? null : dept - 1));
    } else {
      return a.concat([b]);
    }
  }, []);
}
