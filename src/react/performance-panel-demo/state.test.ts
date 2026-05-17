/** @vitest-environment jsdom */

import { beforeEach, describe, expect, test } from "vitest";
import {
  lessonOneStats,
  resetLessonOneStats,
  runBaselineInteractionBatch,
  runHeavyInteractionBatch,
} from "./state";

describe("performance-panel-demo lesson one state", () => {
  beforeEach(() => {
    resetLessonOneStats();
  });

  test("runBaselineInteractionBatch updates baseline stats", () => {
    const duration = runBaselineInteractionBatch(20);
    expect(duration).toBeGreaterThanOrEqual(0);
    expect(lessonOneStats.baselineRuns).toBe(1);
    expect(lessonOneStats.heavyRuns).toBe(0);
    expect(lessonOneStats.totalInteractions).toBe(20);
    expect(lessonOneStats.lastScenario).toBe("baseline");
  });

  test("runHeavyInteractionBatch updates heavy stats", () => {
    const duration = runHeavyInteractionBatch(10);
    expect(duration).toBeGreaterThanOrEqual(0);
    expect(lessonOneStats.baselineRuns).toBe(0);
    expect(lessonOneStats.heavyRuns).toBe(1);
    expect(lessonOneStats.totalInteractions).toBe(10);
    expect(lessonOneStats.lastScenario).toBe("heavy");
  });

  test("resetLessonOneStats clears all counters", () => {
    runBaselineInteractionBatch(5);
    runHeavyInteractionBatch(5);
    resetLessonOneStats();
    expect(lessonOneStats.baselineRuns).toBe(0);
    expect(lessonOneStats.heavyRuns).toBe(0);
    expect(lessonOneStats.totalInteractions).toBe(0);
    expect(lessonOneStats.lastDurationMs).toBe(0);
    expect(lessonOneStats.lastScenario).toBe("none");
  });
});
