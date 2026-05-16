import { pushDetachedNode } from "./state";

export const LESSON2_DETACHED_CASE_TITLE = "浮层节点 · 仅从文档移除但仍被引用";

/**
 * 单次：节点插入 document 再移除，无任何全局引用 → 可被 GC（无本 demo 的 detached 登记）。
 */
export function simulateDetachedCycleClean(): void {
  const node = document.createElement("div");
  node.textContent = "toast-overlay";
  node.setAttribute("data-lesson2-case", "clean");
  document.body.appendChild(node);
  document.body.removeChild(node);
}

/**
 * 单次：同上但从文档移除后仍 push 进全局数组 → Detached + retaining path 指向 demo 容器。
 */
export function simulateDetachedCycleLeaky(seq: number): void {
  const node = document.createElement("div");
  node.textContent = `tooltip-shell-${seq}`;
  node.setAttribute("data-lesson2-case", "leaky");
  document.body.appendChild(node);
  document.body.removeChild(node);
  pushDetachedNode(node);
}

export function runDetachedScenarioClean(iterations: number): void {
  const n = Math.max(0, Math.floor(iterations));
  for (let i = 0; i < n; i++) {
    simulateDetachedCycleClean();
  }
}

export function runDetachedScenarioLeaky(iterations: number): void {
  const n = Math.max(0, Math.floor(iterations));
  for (let i = 0; i < n; i++) {
    simulateDetachedCycleLeaky(i);
  }
}
