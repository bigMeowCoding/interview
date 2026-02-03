import debounce from "./debounce.js";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

describe("debounce", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("应在指定延迟后调用函数", () => {
    const fn = vi.fn();
    const debouncedFn = debounce(fn, 100);

    debouncedFn();
    expect(fn).not.toHaveBeenCalled();

    vi.advanceTimersByTime(100);
    expect(fn).toHaveBeenCalledOnce();
  });

  it("应在延迟时间内多次调用时只执行一次", () => {
    const fn = vi.fn();
    const debouncedFn = debounce(fn, 100);

    debouncedFn();
    debouncedFn();
    debouncedFn();

    vi.advanceTimersByTime(100);
    expect(fn).toHaveBeenCalledOnce();
  });

  it("应传递正确的参数", () => {
    const fn = vi.fn();
    const debouncedFn = debounce(fn, 100);

    debouncedFn("arg1", "arg2");
    vi.advanceTimersByTime(100);

    expect(fn).toHaveBeenCalledWith("arg1", "arg2");
  });
});
