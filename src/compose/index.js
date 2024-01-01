export function compose(...funcs) {
  if (!funcs) {
    return (args) => args;
  }
  if(funcs.length===1) {
    return funcs[0]
  }
  return funcs.reduce((a, b) => {
    return (...args) => {
      return a(b(...args));
    };
  });
}
