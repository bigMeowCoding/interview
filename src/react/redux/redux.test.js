// 导入简易Redux实现和reducer
// 假设它们定义在'simpleRedux.js'文件中
import { describe, beforeEach, expect, test } from "vitest";
import { counterReducer, createStore } from "./redux.js";

describe("counterReducer", () => {
  let store;

  beforeEach(() => {
    store = createStore(counterReducer,0);
  });

  test("should return initial state", () => {
    expect(store.getState()).toBe(0);
  });

  test("should increment state", () => {
    store.dispatch({ type: "INCREMENT" });
    expect(store.getState()).toBe(1);
  });

  test("should decrement state", () => {
    store.dispatch({ type: "INCREMENT" });
      store.dispatch({ type: "INCREMENT" });
    store.dispatch({ type: "DECREMENT" });
    expect(store.getState()).toBe(1);
  });

  test("should handle unknown action", () => {
    store.dispatch({ type: "UNKNOWN" });
    expect(store.getState()).toBe(0);
  });
});
