import { registerLeakyListener, pushDetachedNode } from "./state";

/** 业务映射名称，便于讲义与 UI 描述一致 */
export const LESSON1_DRAWER_CASE_TITLE = "列表页 · 详情抽屉反复开关";

/**
 * 单次「打开抽屉 → 关上」且实现正确：监听与临时 DOM 均释放，
 * 不经过本 demo 的泄漏登记（堆里仍可能有引擎/React 噪声，但不应线性累积监听/DOM 泄漏）。
 */
export function simulateDrawerCycleClean(): void {
  const onMove = () => undefined;
  window.addEventListener("mousemove", onMove);
  window.removeEventListener("mousemove", onMove);

  const panel = document.createElement("aside");
  panel.textContent = "drawer-panel";
  panel.setAttribute("data-lesson1-case", "clean");
  document.body.appendChild(panel);
  document.body.removeChild(panel);
}

/**
 * 单次泄漏版：关上抽屉后仍保留 window 监听 + 已移除节点被全局数组引用，
 * 对应常见失误（useEffect 无 cleanup、把节点 push 进模块级缓存）。
 */
export function simulateDrawerCycleLeaky(cycleIndex: number): void {
  const onMove = () => undefined;
  registerLeakyListener({ target: window, type: "mousemove", handler: onMove });

  const panel = document.createElement("aside");
  panel.textContent = `drawer-order-${cycleIndex}`;
  panel.setAttribute("data-lesson1-case", "leaky");
  document.body.appendChild(panel);
  document.body.removeChild(panel);
  pushDetachedNode(panel);
}

export function runDrawerScenarioClean(iterations: number): void {
  const n = Math.max(0, Math.floor(iterations));
  for (let i = 0; i < n; i++) {
    simulateDrawerCycleClean();
  }
}

export function runDrawerScenarioLeaky(iterations: number): void {
  const n = Math.max(0, Math.floor(iterations));
  for (let i = 0; i < n; i++) {
    simulateDrawerCycleLeaky(i);
  }
}
