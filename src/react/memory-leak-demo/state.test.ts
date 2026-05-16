/** @vitest-environment jsdom */

import { describe, expect, test, beforeEach } from "vitest";
import {
  resetLeakDemoState,
  leakCounters,
  detachedDomNodes,
  activeIntervalIds,
  pushDetachedNode,
  leakHugeString,
  clearHugeStrings,
  startLeakyInterval,
  clearAllLeakyIntervals,
  registerLeakyListener,
  removeAllLeakyListeners,
} from "./state";

describe("memory-leak-demo state", () => {
  beforeEach(() => {
    resetLeakDemoState();
  });

  test("resetLeakDemoState clears counters and arrays", () => {
    pushDetachedNode(document.createElement("div"));
    leakHugeString();
    const id = startLeakyInterval(5000);
    expect(detachedDomNodes.length).toBeGreaterThan(0);
    expect(leakCounters.millionCharStrings).toBe(1);
    expect(activeIntervalIds).toContain(id);

    resetLeakDemoState();
    expect(detachedDomNodes.length).toBe(0);
    expect(leakCounters.millionCharStrings).toBe(0);
    expect(leakCounters.intervals).toBe(0);
    expect(activeIntervalIds.length).toBe(0);
  });

  test("clearHugeStrings empties retention", () => {
    leakHugeString();
    expect(leakCounters.millionCharStrings).toBe(1);
    clearHugeStrings();
    expect(leakCounters.millionCharStrings).toBe(0);
  });

  test("removeAllLeakyListeners clears registered listeners", () => {
    const handler = () => {};
    registerLeakyListener({ target: window, type: "scroll", handler });
    expect(leakCounters.eventListeners).toBe(1);
    removeAllLeakyListeners();
    expect(leakCounters.eventListeners).toBe(0);
  });

  test("clearAllLeakyIntervals clears interval ids", () => {
    startLeakyInterval(30000);
    expect(leakCounters.intervals).toBe(1);
    clearAllLeakyIntervals();
    expect(leakCounters.intervals).toBe(0);
    expect(activeIntervalIds.length).toBe(0);
  });
});
