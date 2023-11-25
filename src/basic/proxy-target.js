let obj = {};

function proxy(target, setBind, getBind) {
  return new Proxy(target, {
    set(target, p, newValue, receiver) {
      setBind(target, p, newValue);
      return Reflect.set(target, p, newValue, receiver);
    },
    get(target, p, receiver) {
      getBind(target, p);
      return Reflect.get(target, p, receiver);
    },
  });
}

const proxyObj = proxy(
  obj,
  (target, key, value) => {
    console.log("setValue", target, key, value);
  },
  (target, key) => {
    console.log("getValue", target, key);
  },
);
proxyObj.a = 1;
console.log(proxyObj.a)
