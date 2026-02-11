import { ModuleFilenameHelpers } from "webpack";

let targetMap = new WeakMap();
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
  const depsMap = targetMap.get(target);
  if (!depsMap) return;
  const deps = depsMap.get(key);
  if (!deps) return;
  const set = new Set(deps);
  set.forEach((effect) => {
    if (effect === activeEffect) return;
    if (effect.options.schedule) {
      effect.options.schedule();
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
      let ret = Reflect.set(target, key, value, receiver);
      if (oldValue !== value) {
        trigger(target, key);
      }
      return ret;
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
  effectFn.options = options;
  effectFn.deps = [];
  if (!options.lazy) {
    effectFn();
  }
  return effectFn;
}

export function cleanup(effect) {
  effect.deps.forEach((dep) => {
    dep.delete(effect);
  });
  effect.deps.length = 0;
}

export function ref(value) {
  let wrapper = {
    _value: value,
    get value() {
      track(wrapper, "value");
      return this._value;
    },
    set value(param) {
      if (param !== this.value) {
        this._value = param;
        trigger(wrapper, "value");
      }
    },
  };
  return wrapper;
}
export function computed(getter) {
  let dirty = true;
  let value = null;
  const runner = effect(getter, {
    lazy: true,
    schedule: () => {
      dirty = true;
      trigger(wrapper, "value");
    },
  });
  let wrapper = {
    get value() {
      if (dirty) {
        value = runner();
        dirty = false;
      }
      track(wrapper, "value");
      return value;
    },
  };
  return wrapper;
}
