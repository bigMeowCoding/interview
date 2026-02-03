// throttle.js 的测试用例（假设 throttle 函数已导出）
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import throttle from "./throttle";

describe("throttle", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
  });

  it("在给定时间内只执行一次", () => {
    const fn = vi.fn();
    const throttled = throttle(fn, 200);

    throttled();
    throttled();
    throttled();

    expect(fn).toHaveBeenCalledTimes(1);
  });

  it("超过等待时间后再次触发", () => {
    const fn = vi.fn();
    const throttled = throttle(fn, 200);

    throttled();
    expect(fn).toHaveBeenCalledTimes(1);

    vi.advanceTimersByTime(200);
    throttled();
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it("正确传递参数与上下文", () => {
    const fn = vi.fn();
    const throttled = throttle(fn, 200);
    const obj = { val: 42 };

    throttled.call(obj, 1, 2, 3);
    expect(fn).toHaveBeenCalledWith(1, 2, 3);
    expect(fn.mock.instances[0]).toBe(obj);
  });
});
