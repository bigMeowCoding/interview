let activeEffect = null;
const effectStack = [];
const targetMap = new WeakMap();

export function track(target, key) {
  if (!activeEffect) return;
  let depsMap = targetMap.get(target);
  if (!depsMap) {
    depsMap = new Map();
    targetMap.set(target, depsMap);
  }
  let dep = depsMap.get(key);
  if (!dep) {
    dep = new Set();
    depsMap.set(key, dep);
  }
  dep.add(activeEffect);
  activeEffect.deps.push(dep);
}

export function trigger(target, key) {
  const depsMap = targetMap.get(target);
  if (!depsMap) return;
  const dep = depsMap.get(key);
  if (!dep) return;
  const effectsToRun = new Set(dep);
  effectsToRun.forEach((effect) => {
    if (effect !== activeEffect) {
      if (effect.scheduler) {
        effect.scheduler();
      } else {
        effect();
      }
    }
  });
}

export function reactive(target) {
  return new Proxy(target, {
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
}

export function effect(fn, options = {}) {
  const effectFn = () => {
    cleanUp(effectFn);
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
  effectFn.scheduler = options.scheduler;

  if (!options.lazy) {
    effectFn();
  }

  return effectFn;
}

export function cleanUp(effectFn) {
  effectFn.deps.forEach((dep) => {
    dep.delete(effectFn);
  });
  effectFn.deps.length = 0;
}

export function ref(value) {
  const wrapper = {
    _value: value,
    get value() {
      track(wrapper, "value");
      return this._value;
    },
    set value(newValue) {
      if (newValue !== this._value) {
        this._value = newValue;
        trigger(wrapper, "value");
      }
    },
  };
  return wrapper;
}

export function computed(getter) {
  let dirty = true;
  let value;
  const runner = effect(getter, {
    lazy: true,
    scheduler: () => {
      dirty = true;
      trigger(wrapper, "value");
    },
  });

  const wrapper = {
    get value() {
      track(wrapper, "value");
      if (dirty) {
        value = runner();
        dirty = false;
      }
      return value;
    },
  };
  return wrapper;
}
