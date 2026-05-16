/** 演示用全局状态：刻意保留引用以便在 Heap Snapshot 中观察 */

export const detachedDomNodes: HTMLElement[] = [];

export const leakCounters = {
  /** 通过 addEventListener 注册且未 remove 的监听次数 */
  eventListeners: 0,
  intervals: 0,
  detachedDomRegistered: 0,
  millionCharStrings: 0,
};

type ListenerEntry = { target: Window | Document; type: string; handler: EventListener };

const registeredListeners: ListenerEntry[] = [];
export const activeIntervalIds: number[] = [];

export function resetLeakDemoState(): void {
  for (const id of activeIntervalIds) {
    window.clearInterval(id);
  }
  activeIntervalIds.length = 0;
  for (const { target, type, handler } of registeredListeners) {
    target.removeEventListener(type, handler);
  }
  registeredListeners.length = 0;
  detachedDomNodes.length = 0;
  hugeStringRetention.length = 0;
  leakCounters.eventListeners = 0;
  leakCounters.intervals = 0;
  leakCounters.detachedDomRegistered = 0;
  leakCounters.millionCharStrings = 0;
}

export function registerLeakyListener(entry: ListenerEntry): void {
  registeredListeners.push(entry);
  entry.target.addEventListener(entry.type, entry.handler);
  leakCounters.eventListeners += 1;
}

export function removeAllLeakyListeners(): void {
  for (const { target, type, handler } of registeredListeners) {
    target.removeEventListener(type, handler);
  }
  registeredListeners.length = 0;
  leakCounters.eventListeners = 0;
}

export function pushDetachedNode(node: HTMLElement): void {
  detachedDomNodes.push(node);
  leakCounters.detachedDomRegistered = detachedDomNodes.length;
}

const hugeStringRetention: string[] = [];

export function leakHugeString(): void {
  hugeStringRetention.push("x".repeat(1_000_000));
  leakCounters.millionCharStrings = hugeStringRetention.length;
}

export function clearHugeStrings(): void {
  hugeStringRetention.length = 0;
  leakCounters.millionCharStrings = 0;
}

export function startLeakyInterval(ms: number): number {
  const id = window.setInterval(() => {
    /* 保持闭包活跃 */
  }, ms);
  activeIntervalIds.push(id);
  leakCounters.intervals = activeIntervalIds.length;
  return id;
}

export function clearAllLeakyIntervals(): void {
  for (const id of activeIntervalIds) {
    window.clearInterval(id);
  }
  activeIntervalIds.length = 0;
  leakCounters.intervals = 0;
}
