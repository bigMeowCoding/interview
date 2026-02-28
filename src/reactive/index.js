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
  effect.deps.forEach((dep) => {
    dep.delete(effect);
  });
}

export function ref(value) {
  const wrapper = {
    _value: value,
    get value() {
      track(wrapper, "value");
      return this._value;
    },
    set value(val) {
      if (val !== this._value) {
        this._value = val;

        trigger(wrapper, "value");
      }
    },
  };
  return wrapper;
}
export function computed(getter) {
  let dirty = true;
  let value = null;
  let effectFn = effect(getter, {
    schedule: () => {
      if (dirty) {
        return;
      }
      dirty = true;
      trigger(wrapper, "value");
    },
    lazy: true,
  });
  const wrapper = {
    get value() {
      track(wrapper, "value");
      if (dirty) {
        value = effectFn();
        dirty = false;
      }

      return value;
    },
  };
  return wrapper;
}
