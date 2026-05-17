/** @vitest-environment jsdom */

import { beforeEach, describe, expect, test, vi } from "vitest";
import {
  lessonOneStats,
  resetLessonOneStats,
  runBaselineInteractionBatch,
  runChunkedHeavyInteractionBatch,
  runHeavyInteractionBatch,
  runInputDeferredSearch,
  runInputSyncSearch,
  runLesson3SyncBurst,
  scheduleLesson3DeferredBurstFinal,
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

  test("runInputSyncSearch updates sync input stats", () => {
    const duration = runInputSyncSearch("hello");
    expect(duration).toBeGreaterThanOrEqual(0);
    expect(lessonOneStats.inputSyncRuns).toBe(1);
    expect(lessonOneStats.inputDeferredRuns).toBe(0);
    expect(lessonOneStats.totalInteractions).toBe(1);
    expect(lessonOneStats.lastScenario).toBe("input-sync");
  });

  test("runInputDeferredSearch updates deferred input stats", () => {
    const duration = runInputDeferredSearch("world");
    expect(duration).toBeGreaterThanOrEqual(0);
    expect(lessonOneStats.inputSyncRuns).toBe(0);
    expect(lessonOneStats.inputDeferredRuns).toBe(1);
    expect(lessonOneStats.totalInteractions).toBe(1);
    expect(lessonOneStats.lastScenario).toBe("input-deferred");
  });

  test("runLesson3SyncBurst runs sync search N times", () => {
    runLesson3SyncBurst(4);
    expect(lessonOneStats.inputSyncRuns).toBe(4);
    expect(lessonOneStats.inputDeferredRuns).toBe(0);
  });

  test("scheduleLesson3DeferredBurstFinal fires only one deferred search", async () => {
    vi.useFakeTimers();
    const p = scheduleLesson3DeferredBurstFinal(5, 60);
    await vi.runAllTimersAsync();
    await p;
    expect(lessonOneStats.inputDeferredRuns).toBe(1);
    expect(lessonOneStats.inputSyncRuns).toBe(0);
    vi.useRealTimers();
  });

  test("resetLessonOneStats clears all counters", () => {
    runBaselineInteractionBatch(5);
    runHeavyInteractionBatch(5);
    lessonOneStats.chunkedRuns = 3;
    lessonOneStats.inputSyncRuns = 2;
    lessonOneStats.inputDeferredRuns = 2;
    resetLessonOneStats();
    expect(lessonOneStats.baselineRuns).toBe(0);
    expect(lessonOneStats.heavyRuns).toBe(0);
    expect(lessonOneStats.chunkedRuns).toBe(0);
    expect(lessonOneStats.inputSyncRuns).toBe(0);
    expect(lessonOneStats.inputDeferredRuns).toBe(0);
    expect(lessonOneStats.totalInteractions).toBe(0);
    expect(lessonOneStats.lastDurationMs).toBe(0);
    expect(lessonOneStats.lastScenario).toBe("none");
  });
});
