import { leakHugeString } from "./state";

export const LESSON4_HUGE_STRING_CASE_TITLE =
  "全局数组缓存大字符串 · 用 Retained 排序抓「大户」";

/**
 * 一轮：分配与泄漏路径相同量级的字符串，但仅作为临时值不写入全局 `hugeStringRetention`。
 */
export function simulateHugeStringCycleClean(): void {
  void "x".repeat(1_000_000);
}

/**
 * 一轮：推入演示用全局数组，与手动「泄漏 ~1MB 字符串」同源。
 */
export function simulateHugeStringCycleLeaky(): void {
  leakHugeString();
}

export function runHugeStringScenarioClean(iterations: number): void {
  const n = Math.max(0, Math.floor(iterations));
  for (let i = 0; i < n; i++) {
    simulateHugeStringCycleClean();
  }
}

export function runHugeStringScenarioLeaky(iterations: number): void {
  const n = Math.max(0, Math.floor(iterations));
  for (let i = 0; i < n; i++) {
    simulateHugeStringCycleLeaky();
  }
}
