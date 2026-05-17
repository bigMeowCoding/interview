export interface LessonOneStats {
  baselineRuns: number;
  heavyRuns: number;
  chunkedRuns: number;
  inputSyncRuns: number;
  inputDeferredRuns: number;
  totalInteractions: number;
  lastDurationMs: number;
  lastScenario:
    | "baseline"
    | "heavy"
    | "chunked"
    | "input-sync"
    | "input-deferred"
    | "none";
}

export const lessonOneStats: LessonOneStats = {
  baselineRuns: 0,
  heavyRuns: 0,
  chunkedRuns: 0,
  inputSyncRuns: 0,
  inputDeferredRuns: 0,
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

/**
 * 故意做成「每次调用都明显吃主线程」：
 * 否则在快机器上单次 onChange 只有亚毫秒级，同步和防抖看起来像没区别。
 * 对比时请看：同步录制里 User Timing `lesson3-input-sync-duration` 出现次数 ≈ 键入次数；
 * 防抖录制里 `lesson3-input-deferred-duration` 通常只出现 1 次（停手后）。
 */
function simulateSearchWorkload(keyword: string, rounds = 24_000): number {
  const base = keyword.length > 0 ? keyword : "demo";
  let score = 0;
  for (let i = 0; i < rounds; i += 1) {
    const payload = `${base}-${i}-${base.repeat(2)}`;
    score += payload.includes(base) ? 1 : 0;
    score += (i * 17) % 13;
  }
  // 固定阻塞：保证单次重算在 Performance 里是「粗」的黄色条，手打也能感到顿。
  score += blockMainThreadForMs(52);
  return score;
}

/** 与实验区 input 防抖一致，便于「一键防抖演示」和真实输入对照。 */
export const LESSON3_INPUT_DEBOUNCE_MS = 400;

/**
 * 同步连跑多次重算：模拟极快连击，中间没有任何让出。
 * 录制时点一下即可看到多条 lesson3-input-sync-duration。
 */
export function runLesson3SyncBurst(steps = 8): void {
  for (let i = 1; i <= steps; i += 1) {
    runInputSyncSearch(`lesson3-burst-${i}`);
  }
}

/**
 * 模拟连续 8 次「只差最后一个字符」的防抖输入：每次都 clearTimeout 再设新的，
 * 最后只会执行一次 runInputDeferredSearch。
 */
export function scheduleLesson3DeferredBurstFinal(
  steps = 8,
  debounceMs = LESSON3_INPUT_DEBOUNCE_MS,
): Promise<number> {
  return new Promise((resolve, reject) => {
    let id: number | null = null;
    for (let i = 1; i <= steps; i += 1) {
      if (id != null) {
        window.clearTimeout(id);
      }
      const keyword = `lesson3-burst-${i}`;
      id = window.setTimeout(() => {
        try {
          const ms = runInputDeferredSearch(keyword);
          resolve(ms);
        } catch (e) {
          reject(e instanceof Error ? e : new Error(String(e)));
        }
      }, debounceMs);
    }
  });
}

function yieldToMainThread(): Promise<void> {
  return new Promise((resolve) => {
    window.setTimeout(() => resolve(), 0);
  });
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

/**
 * 第二课：把原本单段阻塞拆成多个 chunk，中间主动让出主线程。
 * 这样在 Performance 里会从“一个长任务”变成“多个短任务”。
 */
export async function runChunkedHeavyInteractionBatch(
  iterations = 24,
  chunkSize = 4,
): Promise<number> {
  const startMark = "lesson2-chunked-start";
  const endMark = "lesson2-chunked-end";
  const measureName = "lesson2-chunked-duration";
  markStart(startMark);
  const start = performance.now();
  let checksum = 0;

  for (let i = 0; i < iterations; i += chunkSize) {
    const chunkEnd = Math.min(i + chunkSize, iterations);
    for (let idx = i; idx < chunkEnd; idx += 1) {
      const arr = buildAndSortPayload(idx);
      checksum += scanPayloadRepeatedly(arr);
    }
    await yieldToMainThread();
  }

  for (let elapsed = 0; elapsed < 120; elapsed += 12) {
    checksum += blockMainThreadForMs(12);
    await yieldToMainThread();
  }

  if (checksum < 0) {
    throw new Error("unexpected checksum");
  }
  const duration = performance.now() - start;
  measureRange(measureName, startMark, endMark);
  lessonOneStats.chunkedRuns += 1;
  lessonOneStats.totalInteractions += iterations;
  lessonOneStats.lastDurationMs = duration;
  lessonOneStats.lastScenario = "chunked";
  return duration;
}

export function runInputSyncSearch(keyword: string): number {
  const startMark = "lesson3-input-sync-start";
  const endMark = "lesson3-input-sync-end";
  const measureName = "lesson3-input-sync-duration";
  markStart(startMark);
  const start = performance.now();
  const score = simulateSearchWorkload(keyword);
  if (score < 0) {
    throw new Error("unexpected score");
  }
  const duration = performance.now() - start;
  measureRange(measureName, startMark, endMark);
  lessonOneStats.inputSyncRuns += 1;
  lessonOneStats.totalInteractions += 1;
  lessonOneStats.lastDurationMs = duration;
  lessonOneStats.lastScenario = "input-sync";
  return duration;
}

export function runInputDeferredSearch(keyword: string): number {
  const startMark = "lesson3-input-deferred-start";
  const endMark = "lesson3-input-deferred-end";
  const measureName = "lesson3-input-deferred-duration";
  markStart(startMark);
  const start = performance.now();
  const score = simulateSearchWorkload(keyword);
  if (score < 0) {
    throw new Error("unexpected score");
  }
  const duration = performance.now() - start;
  measureRange(measureName, startMark, endMark);
  lessonOneStats.inputDeferredRuns += 1;
  lessonOneStats.totalInteractions += 1;
  lessonOneStats.lastDurationMs = duration;
  lessonOneStats.lastScenario = "input-deferred";
  return duration;
}

export function resetLessonOneStats(): void {
  lessonOneStats.baselineRuns = 0;
  lessonOneStats.heavyRuns = 0;
  lessonOneStats.chunkedRuns = 0;
  lessonOneStats.inputSyncRuns = 0;
  lessonOneStats.inputDeferredRuns = 0;
  lessonOneStats.totalInteractions = 0;
  lessonOneStats.lastDurationMs = 0;
  lessonOneStats.lastScenario = "none";
}
