const targetMap = new WeakMap();
let activeEffect = null;
let effectStack = [];

export function track(target, key) {
  if (!activeEffect) {
    return;
  }
  let depsMap = targetMap.get(target);
  if (!depsMap) {
    depsMap = new Map();
    targetMap.set(target, depsMap);
  }
  let deps = depsMap.get(key);
  if (!deps) {
    deps = new Set();
    depsMap.set(key, deps);
  }

  deps.add(activeEffect);
  activeEffect.deps.push(deps);
}

export function trigger(target, key) {
  let depsMap = targetMap.get(target);
  if (!depsMap) {
    return;
  }
  const deps = depsMap.get(key);
  if (!deps) {
    return;
  }
  const set = new Set(deps);
  set.forEach((effect) => {
    if (effect === activeEffect) {
      return;
    }
    if (effect.options.scheduler) {
      effect.options.scheduler();
    } else {
      effect();
    }
  });
}

export function reactive(target) {
  return new Proxy(target, {
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
      if (oldValue !== value) {
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
    effectStack.push(effectFn);
    try {
      return fn();
    } finally {
      effectStack.pop();
      activeEffect = effectStack[effectStack.length - 1] || null;
    }
  };
  effectFn.deps = [];
  effectFn.options = options;
  if (!options.lazy) {
    effectFn();
  }
  return effectFn;
}
export function cleanup(effect) {
  effect.deps.forEach((set) => {
    set.delete(effect);
  });
  effect.deps.length = 0;
}
