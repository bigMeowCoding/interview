/** @vitest-environment jsdom */

import { describe, expect, test, beforeEach } from "vitest";
import { runDetachedScenarioClean, runDetachedScenarioLeaky } from "./lesson2-detached-case";
import { detachedDomNodes, resetLeakDemoState } from "./state";

describe("lesson2 detached-only case", () => {
  beforeEach(() => {
    resetLeakDemoState();
  });

  test("clean cycles do not retain detached refs in demo registry", () => {
    runDetachedScenarioClean(40);
    expect(detachedDomNodes.length).toBe(0);
  });

  test("leaky cycles accumulate one detached ref per iteration", () => {
    runDetachedScenarioLeaky(8);
    expect(detachedDomNodes.length).toBe(8);
  });
});
