export function dateParamUtil(time) {
  const arr = [60, 3600, 24 * 3600, 7 * 24 * 3600, 30 * 24 * 3600];

  for (let i = 0; i < arr.length; i++) {
    if (arr[i] >= time) {
      if (i === 0) {
        return arr[i];
      }
      return arr[i - 1];
    }
  }
  return arr[arr.length - 1];
}
