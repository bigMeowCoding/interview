export function compose(...funcs) {
  if (!funcs) {
    return (args) => args;
  }
  return funcs.reduce((a, b) => {
    return (...args) => {
      return a(b(...args));
    };
  });
}
