let activeEffect = null;
let effectStack = [];

const targetMap = new WeakMap();

export function track(target, key) {
  if (!activeEffect) return;
  let depsMap = targetMap.get(target);
  if (!depsMap) {
    targetMap.set(target, (depsMap = new Map()));
  }
  let dep = depsMap.get(key);
  if (!dep) {
    depsMap.set(key, (dep = new Set()));
  }
  dep.add(activeEffect);
  activeEffect.deps.push(dep);
}

export function trigger(target, key) {
  const depsMap = targetMap.get(target);
  if (!depsMap) return;
  const dep = depsMap.get(key);
  if (!dep) return;
  const effects = new Set(dep);
  effects.forEach((effect) => {
    if (effect === activeEffect) return;
    if (effect.options.scheduler) {
      effect.options.scheduler(effect);
    } else {
      effect();
    }
  });
}

export function reactive(target) {
  const proxy = new Proxy(target, {
    get(target, key, receiver) {
      track(target, key);
      const result = Reflect.get(target, key, receiver);
      if (typeof result === "object" && result !== null) {
        return reactive(result);
      }
      return result;
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
  return proxy;
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
      activeEffect = effectStack[effectStack.length - 1];
    }
  };
  effectFn.options = options;
  effectFn.deps = [];
  if (!options.lazy) {
    effectFn();
  }

  return effectFn;
}
export function cleanup(effectFn) {
  effectFn.deps.forEach((dep) => {
    dep.delete(effectFn);
  });
  effectFn.deps.length = 0;
}
export function ref(val) {
  const refObject = {
    __v_isRef: true,
    _value: val,
    get value() {
      track(refObject, "value");
      return this._value;
    },
    set value(newVal) {
      if (this._value !== newVal) {
        this._value = newVal;
        trigger(refObject, "value");
      }
    },
  };
  return refObject;
}
export function computed(getter) {
  let value = undefined;
  let dirty = true;
  const runner = effect(getter, {
    lazy: true,
    scheduler: () => {
      dirty = true;
      trigger(refObject, "value");
    },
  });

  const refObject = {
    get value() {
      track(refObject, "value");
      if (dirty) {
        value = runner();
        dirty = false;
      }

      return value;
    },
  };
  return refObject;
}
