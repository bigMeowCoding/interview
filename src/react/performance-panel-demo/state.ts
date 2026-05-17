export interface LessonOneStats {
  baselineRuns: number;
  heavyRuns: number;
  totalInteractions: number;
  lastDurationMs: number;
  lastScenario: "baseline" | "heavy" | "none";
}

export const lessonOneStats: LessonOneStats = {
  baselineRuns: 0,
  heavyRuns: 0,
  totalInteractions: 0,
  lastDurationMs: 0,
  lastScenario: "none",
};

function ascendingNumber(a: number, b: number): number {
  return a - b;
}

function buildAndSortPayload(seed: number): number[] {
  const arr: number[] = [];
  for (let j = 3200; j >= 0; j -= 1) {
    arr.push((j * (seed + 3)) % 97);
  }
  arr.sort(ascendingNumber);
  return arr;
}

function scanPayloadRepeatedly(arr: number[]): number {
  let local = 0;
  for (let k = 0; k < 8; k += 1) {
    for (let m = 0; m < arr.length; m += 1) {
      local += (arr[m] + k) % 11;
    }
  }
  return local;
}

function blockMainThreadForMs(blockMs: number): number {
  const blockStart = performance.now();
  let spin = 0;
  while (performance.now() - blockStart < blockMs) {
    spin += 1;
  }
  return spin;
}

function markStart(markName: string): void {
  if (typeof performance === "undefined") {
    return;
  }
  performance.mark(markName);
}

function measureRange(
  measureName: string,
  startMark: string,
  endMark: string,
): void {
  if (typeof performance === "undefined") {
    return;
  }
  performance.mark(endMark);
  performance.measure(measureName, startMark, endMark);
}

/**
 * 第一课只需要“可比样本”。
 * baseline 交互保持轻量，帮助你先熟悉录制区间与时间轴定位。
 */
export function runBaselineInteractionBatch(iterations = 120): number {
  const startMark = "lesson1-baseline-start";
  const endMark = "lesson1-baseline-end";
  const measureName = "lesson1-baseline-duration";
  markStart(startMark);
  const start = performance.now();
  let checksum = 0;
  for (let i = 0; i < iterations; i += 1) {
    checksum += i % 7;
  }
  // 防止过度优化，确保循环结果被使用。
  if (checksum < 0) {
    throw new Error("unexpected checksum");
  }
  const duration = performance.now() - start;
  measureRange(measureName, startMark, endMark);
  lessonOneStats.baselineRuns += 1;
  lessonOneStats.totalInteractions += iterations;
  lessonOneStats.lastDurationMs = duration;
  lessonOneStats.lastScenario = "baseline";
  return duration;
}

/**
 * heavy 交互用于制造更明显的 Main 线程长任务，
 * 方便你在 Flame Chart 里看到可定位的差异。
 */
export function runHeavyInteractionBatch(iterations = 24): number {
  const startMark = "lesson1-heavy-start";
  const endMark = "lesson1-heavy-end";
  const measureName = "lesson1-heavy-duration";
  markStart(startMark);
  const start = performance.now();
  let checksum = 0;
  for (let i = 0; i < iterations; i += 1) {
    const arr = buildAndSortPayload(i);
    checksum += scanPayloadRepeatedly(arr);
  }

  // 固定同步阻塞，确保高性能机器上仍可见明显长任务。
  checksum += blockMainThreadForMs(120);

  if (checksum < 0) {
    throw new Error("unexpected checksum");
  }
  const duration = performance.now() - start;
  measureRange(measureName, startMark, endMark);
  lessonOneStats.heavyRuns += 1;
  lessonOneStats.totalInteractions += iterations;
  lessonOneStats.lastDurationMs = duration;
  lessonOneStats.lastScenario = "heavy";
  return duration;
}

export function resetLessonOneStats(): void {
  lessonOneStats.baselineRuns = 0;
  lessonOneStats.heavyRuns = 0;
  lessonOneStats.totalInteractions = 0;
  lessonOneStats.lastDurationMs = 0;
  lessonOneStats.lastScenario = "none";
}
