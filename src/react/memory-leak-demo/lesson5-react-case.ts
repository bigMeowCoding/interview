import {
  pushDetachedNode,
  registerLeakyListener,
  startLeakyInterval,
} from "./state";

export const LESSON5_REACT_CASE_TITLE =
  "useEffect 不写 cleanup · 挂载循环如何把监听 / interval / Detached 堆高";

/** 等价于泄漏子组件 `LeakyMountChild` 挂载时 effect 的单次副作用（Unmount 无清理）。 */
export function simulateLeakyMountChildEffect(label: string): void {
  const onResize = () => undefined;
  registerLeakyListener({
    target: window,
    type: "resize",
    handler: onResize,
  });
  startLeakyInterval(2000);

  const el = document.createElement("div");
  el.textContent = `detached-${label}`;
  el.className = "leak-detached-node";
  document.body.appendChild(el);
  document.body.removeChild(el);
  pushDetachedNode(el);
}

/** 等价于干净子组件：监听与定时器在同一轮同步路径内注册并撤掉，不经过本 Demo 泄漏登记。 */
export function simulateCleanMountChildEquivalent(): void {
  const onScroll = () => undefined;
  window.addEventListener("scroll", onScroll, { passive: true });
  window.removeEventListener("scroll", onScroll);
  const id = window.setInterval(() => undefined, 3000);
  window.clearInterval(id);
}

export function runReactLeakScenarioBatch(iterations: number): void {
  const n = Math.max(0, Math.floor(iterations));
  for (let i = 0; i < n; i++) {
    simulateLeakyMountChildEffect(String(i));
  }
}

export function runReactCleanScenarioBatch(iterations: number): void {
  const n = Math.max(0, Math.floor(iterations));
  for (let i = 0; i < n; i++) {
    simulateCleanMountChildEquivalent();
  }
}
