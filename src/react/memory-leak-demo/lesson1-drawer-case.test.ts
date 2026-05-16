/** @vitest-environment jsdom */

import { describe, expect, test, beforeEach } from "vitest";
import { runDrawerScenarioClean, runDrawerScenarioLeaky } from "./lesson1-drawer-case";
import { leakCounters, detachedDomNodes, resetLeakDemoState } from "./state";

describe("lesson1 drawer case", () => {
  beforeEach(() => {
    resetLeakDemoState();
  });

  test("clean scenario does not register leaky listeners or detached refs", () => {
    runDrawerScenarioClean(30);
    expect(leakCounters.eventListeners).toBe(0);
    expect(detachedDomNodes.length).toBe(0);
  });

  test("leaky scenario accumulates listeners and detached nodes 1:1 per cycle", () => {
    runDrawerScenarioLeaky(12);
    expect(leakCounters.eventListeners).toBe(12);
    expect(detachedDomNodes.length).toBe(12);
  });
});
