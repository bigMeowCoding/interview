let targetMap = new WeakMap();
let activeEffect = null;
let effectStack = [];

export function track(target, key) {
  if (!activeEffect) return;
  let effectMap = targetMap.get(target);
  if (!effectMap) {
    effectMap = new Map();
    targetMap.set(target, effectMap);
  }
  let effectSet = effectMap.get(key);
  if (!effectSet) {
    effectSet = new Set();
    effectMap.set(key, effectSet);
  }
  effectSet.add(activeEffect);
  activeEffect.deps.push(effectSet);
}

export function trigger(target, key) {
  const effectMap = targetMap.get(target);
  if (!effectMap) return;

  const effectSet = effectMap.get(key);
  if (!effectSet) return;

  const effectToRun = new Set(effectSet);
  for (const effect of effectToRun) {
    if (effect !== activeEffect) {
      if (effect.options.schedule) {
        effect.options.schedule();
      } else {
        effect();
      }
    }
  }
}

export function reactive(object) {
  return new Proxy(object, {
    get(target, key, receiver) {
      track(target, key);
      const ret = Reflect.get(target, key, receiver);
      if (typeof ret === "object" && ret !== null) {
        return reactive(ret);
      }
      return ret;
    },
    set(target, key, value, receiver) {
      const oldValue = Reflect.get(target, key, receiver);
      const result = Reflect.set(target, key, value, receiver);
      if (value !== oldValue) {
        trigger(target, key);
      }
      return result;
    },
  });
}

export function effect(fn, options = {}) {
  const effectFn = () => {
    cleanup(effectFn);
    activeEffect = effectFn;
    effectStack.push(activeEffect);

    try {
      fn();
    } finally {
      effectStack.pop();
      activeEffect = effectStack[effectStack.length - 1] || null;
    }
  };
  effectFn.deps = [];
  effectFn.options = options;
  if (!options.delay) {
    effectFn();
  }
}

export function cleanup(effect) {
  effect.deps.forEach((dep) => {
    dep.delete(effect);
  });
}
