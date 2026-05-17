/** @vitest-environment jsdom */

import { beforeEach, describe, expect, test } from "vitest";
import {
  lessonOneStats,
  resetLessonOneStats,
  runBaselineInteractionBatch,
  runChunkedHeavyInteractionBatch,
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

  test("runChunkedHeavyInteractionBatch updates chunked stats", async () => {
    const duration = await runChunkedHeavyInteractionBatch(8, 2);
    expect(duration).toBeGreaterThanOrEqual(0);
    expect(lessonOneStats.baselineRuns).toBe(0);
    expect(lessonOneStats.heavyRuns).toBe(0);
    expect(lessonOneStats.chunkedRuns).toBe(1);
    expect(lessonOneStats.totalInteractions).toBe(8);
    expect(lessonOneStats.lastScenario).toBe("chunked");
  });

  test("resetLessonOneStats clears all counters", () => {
    runBaselineInteractionBatch(5);
    runHeavyInteractionBatch(5);
    lessonOneStats.chunkedRuns = 3;
    resetLessonOneStats();
    expect(lessonOneStats.baselineRuns).toBe(0);
    expect(lessonOneStats.heavyRuns).toBe(0);
    expect(lessonOneStats.chunkedRuns).toBe(0);
    expect(lessonOneStats.totalInteractions).toBe(0);
    expect(lessonOneStats.lastDurationMs).toBe(0);
    expect(lessonOneStats.lastScenario).toBe("none");
  });
});
