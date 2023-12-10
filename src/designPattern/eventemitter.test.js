import { describe, it, expect, vi } from "vitest";
import Eventemitter from "./eventemitter.js";

describe("eventemitter", function () {
  it("basic", function () {
    const eventemitter = new Eventemitter();
    const mockFun1 = vi.fn();
    eventemitter.on("event1", mockFun1);
    eventemitter.emit("event1");
    eventemitter.emit("event1");
    expect(mockFun1).toBeCalledTimes(2);

    const mockFun2 = vi.fn();
    eventemitter.on("event2", mockFun2);
    eventemitter.remove("event2", mockFun2);
    eventemitter.emit("event2");
    expect(mockFun2).toBeCalledTimes(0);
  });
  it("函数参数", function () {
    const eventemitter = new Eventemitter();
    const mockFun1 = vi.fn();
    eventemitter.on("event1", mockFun1);
    eventemitter.emit("event1", 3, 2);
    expect(mockFun1).toBeCalledTimes(1);
    expect(mockFun1).toHaveBeenCalledWith(3, 2);
  });
  it("once", function () {
    const eventemitter = new Eventemitter();
    const mockFun1 = vi.fn();
    eventemitter.once("event1", mockFun1);
    eventemitter.emit("event1", 3, 2);
    eventemitter.emit("event1", 3, 2);

    expect(mockFun1).toBeCalledTimes(1);
    expect(mockFun1).toHaveBeenCalledWith(3, 2);
  });
});
