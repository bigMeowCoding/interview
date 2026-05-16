/** @vitest-environment jsdom */

import { afterEach, describe, expect, test } from "vitest";
import { leakCounters, resetLeakDemoState } from "./state";
import {
  runReactCleanScenarioBatch,
  runReactLeakScenarioBatch,
  simulateCleanMountChildEquivalent,
  simulateLeakyMountChildEffect,
} from "./lesson5-react-case";

describe("lesson5-react-case", () => {
  afterEach(() => {
    resetLeakDemoState();
  });

  test("simulateLeakyMountChildEffect increments all three tracked leaks once", () => {
    simulateLeakyMountChildEffect("a");
    expect(leakCounters.eventListeners).toBe(1);
    expect(leakCounters.intervals).toBe(1);
    expect(leakCounters.detachedDomRegistered).toBe(1);
  });

  test("simulateCleanMountChildEquivalent does not touch demo leak counters", () => {
    simulateCleanMountChildEquivalent();
    expect(leakCounters.eventListeners).toBe(0);
    expect(leakCounters.intervals).toBe(0);
    expect(leakCounters.detachedDomRegistered).toBe(0);
  });

  test("batch clean vs leaky scales with iterations", () => {
    runReactCleanScenarioBatch(15);
    expect(leakCounters.eventListeners).toBe(0);

    resetLeakDemoState();
    runReactLeakScenarioBatch(15);
    expect(leakCounters.eventListeners).toBe(15);
    expect(leakCounters.intervals).toBe(15);
    expect(leakCounters.detachedDomRegistered).toBe(15);
  });
});
