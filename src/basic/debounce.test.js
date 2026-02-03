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

  it("应保留 this 上下文", () => {
    const obj = {
      value: 42,
      method: debounce(function () {
        return this.value;
      }, 100)
    };

    let result;
    obj.method().then((val) => (result = val));

    vi.advanceTimersByTime(100);
    expect(result).toBe(42);
  });

  it("应支持立即执行选项", () => {
    const fn = vi.fn();
    const debouncedFn = debounce(fn, 100, { leading: true });

    debouncedFn();
    expect(fn).toHaveBeenCalledOnce();

    vi.advanceTimersByTime(100);
    expect(fn).toHaveBeenCalledOnce();
  });

  it("应支持尾部执行选项", () => {
    const fn = vi.fn();
    const debouncedFn = debounce(fn, 100, { trailing: false });

    debouncedFn();
    debouncedFn();
    vi.advanceTimersByTime(100);

    expect(fn).not.toHaveBeenCalled();
  });

  it("应支持取消功能", () => {
    const fn = vi.fn();
    const debouncedFn = debounce(fn, 100);

    debouncedFn();
    debouncedFn.cancel();
    vi.advanceTimersByTime(100);

    expect(fn).not.toHaveBeenCalled();
  });

  it("应支持刷新功能", () => {
    const fn = vi.fn();
    const debouncedFn = debounce(fn, 100);

    debouncedFn();
    debouncedFn.flush();

    expect(fn).toHaveBeenCalledOnce();
  });

  it("应返回 Promise", async () => {
    const fn = vi.fn(() => "result");
    const debouncedFn = debounce(fn, 100);

    const promise = debouncedFn();
    vi.advanceTimersByTime(100);

    await expect(promise).resolves.toBe("result");
  });
});


