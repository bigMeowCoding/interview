/** @vitest-environment jsdom */

import { describe, expect, test, beforeEach } from "vitest";
import {
  runListenersIntervalScenarioClean,
  runListenersIntervalScenarioLeaky,
} from "./lesson3-listeners-interval-case";
import {
  leakCounters,
  resetLeakDemoState,
} from "./state";

describe("lesson3 listeners + interval case", () => {
  beforeEach(() => {
    resetLeakDemoState();
  });

  test("clean cycles do not register leaky listeners or intervals", () => {
    runListenersIntervalScenarioClean(60);
    expect(leakCounters.eventListeners).toBe(0);
    expect(leakCounters.intervals).toBe(0);
  });

  test("leaky cycles add one tracked listener and one interval per iteration", () => {
    runListenersIntervalScenarioLeaky(7);
    expect(leakCounters.eventListeners).toBe(7);
    expect(leakCounters.intervals).toBe(7);
  });
});
