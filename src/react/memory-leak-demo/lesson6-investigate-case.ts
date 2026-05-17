import {
  pushDetachedNode,
  registerLeakyListener,
  startLeakyInterval,
} from "./state";

export const LESSON6_INVESTIGATE_CASE_TITLE =
  "综合演练 · 源码里「长得像正常业务」的三类脚注式泄漏";

/**
 * 「业务侧可读」写法示意；实验区实际通过这些 API 等价登记到堆里，
 * 便于你在快照 retaining path 里看到与本 demo state 的连接。
 */
export const LESSON6_LEAK_SCENARIO_SNIPPET =
  `/** 右下角「迷你通知面板」每次打开时跑一次（节选） */\n` +
  `function setupLiveNotifyPanel(panel: HTMLElement) {\n` +
  `  // 点空白收起：但没在「面板关闭」路径上 remove\n` +
  `  document.addEventListener("click", onBackdropClick);\n\n` +
  `  // 草稿轮询：未保存返回值 → 离开后无法 clearInterval\n` +
  `  setInterval(syncDraft, 1500);\n\n` +
  `  // 遗留 debug：已从文档摘掉仍塞进模块级缓存\n` +
  `  notifyPanelDebugAnchors.push(panel);\n\n` +
  `  function onBackdropClick() { /* ... */ }\n` +
  `  function syncDraft() { /* ... */ }\n` +
  `}\n`;

/** 等价于示意图中「三类问题各发生一次」。 */
export function simulateLeakyNotifyPanelOnce(): void {
  registerLeakyListener({
    target: document,
    type: "click",
    handler: () => undefined,
  });
  startLeakyInterval(1500);

  const panel = document.createElement("aside");
  panel.textContent = "notify-demo-panel";
  panel.className = "leak-detached-node";
  document.body.appendChild(panel);
  document.body.removeChild(panel);
  pushDetachedNode(panel);
}

/** 同流程但同步 teardown，且不 push 面板节点。 */
export function simulateCleanNotifyPanelOnce(): void {
  const onBackdropClick = () => undefined;
  document.addEventListener("click", onBackdropClick);
  document.removeEventListener("click", onBackdropClick);
  const id = window.setInterval(() => undefined, 1500);
  window.clearInterval(id);

  const panel = document.createElement("aside");
  panel.textContent = "notify-demo-panel-clean";
  document.body.appendChild(panel);
  document.body.removeChild(panel);
}

export function runInvestigateLeakBatch(iterations: number): void {
  const n = Math.max(0, Math.floor(iterations));
  for (let i = 0; i < n; i++) {
    simulateLeakyNotifyPanelOnce();
  }
}

export function runInvestigateCleanBatch(iterations: number): void {
  const n = Math.max(0, Math.floor(iterations));
  for (let i = 0; i < n; i++) {
    simulateCleanNotifyPanelOnce();
  }
}
