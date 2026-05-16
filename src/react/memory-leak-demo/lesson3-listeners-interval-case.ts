import { registerLeakyListener, startLeakyInterval } from "./state";

export const LESSON3_LISTENERS_INTERVAL_CASE_TITLE =
  "全局监听与 setInterval · 离开页面/卸载前要记得清理";

/**
 * 一轮：同步 add/remove document click；再 setInterval + 立即 clear。不写入本 demo 泄漏登记表。
 */
export function simulateListenersAndIntervalCycleClean(): void {
  const onClick = () => undefined;
  document.addEventListener("click", onClick);
  document.removeEventListener("click", onClick);
  const id = window.setInterval(() => undefined, 1500);
  window.clearInterval(id);
}

/**
 * 一轮：与本页手动按钮同源——登记未 remove 的监听与未 clear 的 interval。
 */
export function simulateListenersAndIntervalCycleLeaky(): void {
  const onClick = () => undefined;
  registerLeakyListener({
    target: document,
    type: "click",
    handler: onClick,
  });
  startLeakyInterval(1500);
}

export function runListenersIntervalScenarioClean(iterations: number): void {
  const n = Math.max(0, Math.floor(iterations));
  for (let i = 0; i < n; i++) {
    simulateListenersAndIntervalCycleClean();
  }
}

export function runListenersIntervalScenarioLeaky(iterations: number): void {
  const n = Math.max(0, Math.floor(iterations));
  for (let i = 0; i < n; i++) {
    simulateListenersAndIntervalCycleLeaky();
  }
}
