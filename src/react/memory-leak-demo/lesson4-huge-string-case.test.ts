/** @vitest-environment jsdom */

import { describe, expect, test, beforeEach } from "vitest";
import {
  runHugeStringScenarioClean,
  runHugeStringScenarioLeaky,
} from "./lesson4-huge-string-case";
import { leakCounters, resetLeakDemoState } from "./state";

describe("lesson4 huge string case", () => {
  beforeEach(() => {
    resetLeakDemoState();
  });

  test("clean cycles do not increase retained string counter", () => {
    runHugeStringScenarioClean(12);
    expect(leakCounters.millionCharStrings).toBe(0);
  });

  test("leaky cycles add one ~1MB retained string per iteration", () => {
    runHugeStringScenarioLeaky(8);
    expect(leakCounters.millionCharStrings).toBe(8);
  });
});
