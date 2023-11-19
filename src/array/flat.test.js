import { expect, test, describe, it } from "vitest";
import { flat } from "./flat";

describe("flat", () => {
  it("basic", () => {
    const arr1 = [0, 1, 2, [3, 4]];
    const arr2 = [0, 1, [2, [3, [4, 5]]]];

    expect(flat(arr1)).toEqual([0, 1, 2, 3, 4]);
    expect(flat(arr2)).toEqual([0, 1, 2, 3, 4, 5]);
  });
  it("dept", () => {
    const arr1 = [0, 1, 2, [3, 4]];
    const arr2 = [0, 1, [2, [3, [4, 5]]]];

    expect(flat(arr1, 1)).toEqual([0, 1, 2, 3, 4]);
    expect(flat(arr2, 1)).toEqual([0, 1, 2, [3, [4, 5]]]);
  });
});
