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

/**
 * 第一课只需要“可比样本”。
 * baseline 交互保持轻量，帮助你先熟悉录制区间与时间轴定位。
 */
export function runBaselineInteractionBatch(iterations = 120): number {
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
  const start = performance.now();
  let checksum = 0;
  for (let i = 0; i < iterations; i += 1) {
    const arr: number[] = [];
    for (let j = 3200; j >= 0; j -= 1) {
      arr.push((j * (i + 3)) % 97);
    }
    // 组合排序 + 多轮扫描，确保主线程上形成稳定可见的 Long Task。
    arr.sort((a, b) => a - b);
    let local = 0;
    for (let k = 0; k < 8; k += 1) {
      for (let m = 0; m < arr.length; m += 1) {
        local += (arr[m] + k) % 11;
      }
    }
    checksum += local;
  }

  // 再追加一段固定时长的同步阻塞，避免高性能机器上差异不明显。
  const blockStart = performance.now();
  while (performance.now() - blockStart < 120) {
    checksum += 1;
  }

  if (checksum < 0) {
    throw new Error("unexpected checksum");
  }
  const duration = performance.now() - start;
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
