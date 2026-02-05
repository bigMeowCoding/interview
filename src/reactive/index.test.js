
import { describe, it, expect, vi } from "vitest";
import { reactive, effect } from "./index";

describe("reactive", () => {
  it("should observe basic properties", () => {
    let dummy;
    const counter = reactive({ num: 0 });
    effect(() => (dummy = counter.num));

    expect(dummy).toBe(0);
    counter.num = 7;
    expect(dummy).toBe(7);
  });

  it("should observe multiple properties", () => {
    let dummy;
    const counter = reactive({ num1: 0, num2: 0 });
    effect(() => (dummy = counter.num1 + counter.num2));

    expect(dummy).toBe(0);
    counter.num1 = counter.num2 = 7;
    expect(dummy).toBe(14);
  });

  it("should handle nested reactives", () => {
    const original = {
      nested: {
        foo: 1,
      },
      array: [{ bar: 2 }],
    };
    const observed = reactive(original);
    let dummy;
    effect(() => (dummy = observed.nested.foo));

    expect(dummy).toBe(1);
    observed.nested.foo = 2;
    expect(dummy).toBe(2);
  });

  it("should support branching", () => {
    let dummy;
    const obj = reactive({ run: true, text: "hello" });
    const fn = vi.fn(() => {
        dummy = obj.run ? obj.text : "fallback";
    });
    effect(fn);

    expect(dummy).toBe("hello");
    expect(fn).toHaveBeenCalledTimes(1);

    obj.run = false;
    expect(dummy).toBe("fallback");
    expect(fn).toHaveBeenCalledTimes(2);

    // cleanup check: changing text should NOT trigger effect because run is false
    obj.text = "world";
    expect(dummy).toBe("fallback");
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it("should handle nested effects", () => {
    const nums = reactive({ num1: 0, num2: 10, num3: 100 });
    let dummy1, dummy2;
    
    const childSpy = vi.fn(() => (dummy2 = nums.num2));
    const parentSpy = vi.fn(() => {
        dummy1 = nums.num1;
        effect(childSpy);
        dummy1 += nums.num3; // access num3
    });

    effect(parentSpy);

    expect(dummy1).toBe(100);
    expect(dummy2).toBe(10);
    expect(parentSpy).toHaveBeenCalledTimes(1);
    expect(childSpy).toHaveBeenCalledTimes(1);

    // should trigger parent effect
    nums.num1++;
    expect(dummy1).toBe(101);
    expect(dummy2).toBe(10);
    expect(parentSpy).toHaveBeenCalledTimes(2);
    expect(childSpy).toHaveBeenCalledTimes(2);

    // should trigger child effect
    nums.num2++;
    expect(dummy1).toBe(101);
    expect(dummy2).toBe(11);
    expect(parentSpy).toHaveBeenCalledTimes(2);
    expect(childSpy).toHaveBeenCalledTimes(4);

    // should trigger parent effect
    nums.num3++;
    expect(dummy1).toBe(102);
    expect(dummy2).toBe(11);
    expect(parentSpy).toHaveBeenCalledTimes(3);
    expect(childSpy).toHaveBeenCalledTimes(5);
  });
  
  it("should not cause infinite loop when modifying value inside effect", () => {
      const obj = reactive({ foo: 1 });
      effect(() => {
          obj.foo++;
      });
      // Should stop at some point (implementation dependent, usually handled by not triggering activeEffect)
      // Our implementation does: if (effect !== activeEffect)
      expect(obj.foo).toBe(2);
  });
});
