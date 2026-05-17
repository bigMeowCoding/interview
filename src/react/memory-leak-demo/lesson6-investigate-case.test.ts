/** @vitest-environment jsdom */

import { afterEach, describe, expect, test } from "vitest";
import { leakCounters, resetLeakDemoState } from "./state";
import {
  runInvestigateCleanBatch,
  runInvestigateLeakBatch,
  simulateCleanNotifyPanelOnce,
  simulateLeakyNotifyPanelOnce,
} from "./lesson6-investigate-case";

describe("lesson6 investigate case", () => {
  afterEach(() => {
    resetLeakDemoState();
  });

  test("clean single iteration keeps demo counters at zero", () => {
    resetLeakDemoState();
    simulateCleanNotifyPanelOnce();
    expect(leakCounters.eventListeners).toBe(0);
    expect(leakCounters.intervals).toBe(0);
    expect(leakCounters.detachedDomRegistered).toBe(0);
  });

  test("leaky single iteration increments all three registrations", () => {
    resetLeakDemoState();
    simulateLeakyNotifyPanelOnce();
    expect(leakCounters.eventListeners).toBe(1);
    expect(leakCounters.intervals).toBe(1);
    expect(leakCounters.detachedDomRegistered).toBe(1);
  });

  test("clean batch fifteen leaves counters at zero", () => {
    resetLeakDemoState();
    runInvestigateCleanBatch(15);
    expect(leakCounters.eventListeners).toBe(0);
    expect(leakCounters.intervals).toBe(0);
    expect(leakCounters.detachedDomRegistered).toBe(0);
  });

  test("leaky batch fifteen aligns all three counters with iterations", () => {
    resetLeakDemoState();
    runInvestigateLeakBatch(15);
    expect(leakCounters.eventListeners).toBe(15);
    expect(leakCounters.intervals).toBe(15);
    expect(leakCounters.detachedDomRegistered).toBe(15);
  });
});
