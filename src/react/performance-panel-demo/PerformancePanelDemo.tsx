import { useCallback, useEffect, useReducer, useRef, useState } from "react";
import "./style.css";
import {
  LESSON3_INPUT_DEBOUNCE_MS,
  lessonOneStats,
  resetLessonOneStats,
  runInputDeferredSearch,
  runInputSyncSearch,
  runLesson3SyncBurst,
  scheduleLesson3DeferredBurstFinal,
} from "./state";

function useRerenderTick() {
  const [, bump] = useReducer((n: number) => n + 1, 0);
  return bump;
}

export default function PerformancePanelDemo() {
  const refresh = useRerenderTick();
  const [lastHint, setLastHint] = useState(
    "在下方输入框练习；录 Performance 时用本页即可。",
  );
  const [syncInput, setSyncInput] = useState("");
  const [deferredInput, setDeferredInput] = useState("");
  const [syncDurationMs, setSyncDurationMs] = useState(0);
  const [deferredDurationMs, setDeferredDurationMs] = useState(0);
  const [deferredDemoBusy, setDeferredDemoBusy] = useState(false);
  const deferredTimerRef = useRef<number | null>(null);

  const reset = useCallback(() => {
    resetLessonOneStats();
    setSyncInput("");
    setDeferredInput("");
    setSyncDurationMs(0);
    setDeferredDurationMs(0);
    setDeferredDemoBusy(false);
    if (deferredTimerRef.current != null) {
      window.clearTimeout(deferredTimerRef.current);
      deferredTimerRef.current = null;
    }
    setLastHint("已重置输入与计数，可重新录制。");
    refresh();
  }, [refresh]);

  const onSyncInputChange = useCallback(
    (value: string) => {
      setSyncInput(value);
      const duration = runInputSyncSearch(value);
      setSyncDurationMs(duration);
      setLastHint(`同步输入计算：${duration.toFixed(2)}ms（每次键入都会执行）`);
      refresh();
    },
    [refresh],
  );

  const onDeferredInputChange = useCallback(
    (value: string) => {
      setDeferredInput(value);
      if (deferredTimerRef.current != null) {
        window.clearTimeout(deferredTimerRef.current);
      }
      deferredTimerRef.current = window.setTimeout(() => {
        const duration = runInputDeferredSearch(value);
        setDeferredDurationMs(duration);
        setLastHint(
          `防抖输入计算：${duration.toFixed(2)}ms（停顿后才执行一次重算）`,
        );
        refresh();
      }, LESSON3_INPUT_DEBOUNCE_MS);
    },
    [refresh],
  );

  const onSyncBurstClick = useCallback(() => {
    runLesson3SyncBurst(8);
    setLastHint(
      "已同步连跑 8 次重算：Performance 里应出现 8 条 lesson3-input-sync-duration（页面会明显顿一下）。",
    );
    refresh();
  }, [refresh]);

  const onDeferredBurstClick = useCallback(async () => {
    setDeferredDemoBusy(true);
    setLastHint(
      `等待防抖触发（${LESSON3_INPUT_DEBOUNCE_MS}ms）… 录屏时请把这段也录进去。`,
    );
    const ms = await scheduleLesson3DeferredBurstFinal(
      8,
      LESSON3_INPUT_DEBOUNCE_MS,
    );
    setDeferredDemoBusy(false);
    setDeferredDurationMs(ms);
    setLastHint(
      `防抖演示结束：只算了 1 次（约 ${ms.toFixed(2)}ms），User Timing 里 lesson3-input-deferred-duration 应只有 1 条。`,
    );
    refresh();
  }, [refresh]);

  useEffect(() => {
    return () => {
      if (deferredTimerRef.current != null) {
        window.clearTimeout(deferredTimerRef.current);
      }
    };
  }, []);

  return (
    <main className="performance-panel-demo">
      <h1>Chrome Performance · 第三课</h1>
      <p className="sub">
        单次重算已加重（约几十毫秒级阻塞）。若手打仍感觉不明显，请优先用下面
        <strong>两个一键按钮</strong>录 Performance：同步会出现 8 条 User
        Timing，防抖只会出现 1 条。
      </p>

      <section>
        <h2>跟着做（推荐：一键对比）</h2>
        <ol className="steps">
          <li>
            打开 Performance → Record → 点「
            <strong>一键：同步连跑 8 次重算</strong>」→ Stop。应看到 8 条粗黄条
            / 8 条 <code>lesson3-input-sync-duration</code>。
          </li>
          <li>
            再录一次：Record → 点「
            <strong>一键：防抖只算 1 次</strong>
            」→ 等提示「防抖演示结束」→ Stop。应只有 1 条{" "}
            <code>lesson3-input-deferred-duration</code>。
          </li>
          <li>
            若想练手打：再在两个输入框里快速输入对照（防抖需停手约半秒再结束录制）。
          </li>
        </ol>
      </section>

      <section className="lesson3-lab">
        <h2>实验区</h2>
        <div className="btn-row lesson3-demo-burst">
          <button type="button" className="danger" onClick={onSyncBurstClick}>
            一键：同步连跑 8 次重算（录制时点这个）
          </button>
          <button
            type="button"
            className="secondary"
            disabled={deferredDemoBusy}
            onClick={() => {
              void onDeferredBurstClick();
            }}
          >
            {deferredDemoBusy
              ? "防抖演示进行中…"
              : "一键：防抖只算 1 次（录制时点这个）"}
          </button>
        </div>
        <div className="input-grid">
          <label className="input-card">
            <span className="input-title">同步输入（每次键入都重算）</span>
            <input
              value={syncInput}
              onChange={(e) => onSyncInputChange(e.target.value)}
              placeholder="在这里快速输入"
            />
            <small>最近一次计算耗时：{syncDurationMs.toFixed(2)}ms</small>
          </label>
          <label className="input-card">
            <span className="input-title">防抖输入（停顿后才重算）</span>
            <input
              value={deferredInput}
              onChange={(e) => onDeferredInputChange(e.target.value)}
              placeholder="同样速度输入，停手后再结束录制"
            />
            <small>最近一次计算耗时：{deferredDurationMs.toFixed(2)}ms</small>
          </label>
        </div>
        <div className="btn-row lesson3-reset-row">
          <button type="button" className="fix" onClick={reset}>
            重置输入与统计
          </button>
        </div>
        <p className="hint">{lastHint}</p>
      </section>

      <section className="stats">
        <h2>本课统计</h2>
        <div className="stat">同步重算次数：{lessonOneStats.inputSyncRuns}</div>
        <div className="stat">
          防抖重算次数：{lessonOneStats.inputDeferredRuns}
        </div>
        <div className="stat">
          最近一次场景：{lessonOneStats.lastScenario} / 最近单次耗时：
          {lessonOneStats.lastDurationMs.toFixed(2)}ms
        </div>
      </section>

      <section>
        <h2>过关标准</h2>
        <ul className="checklist">
          <li>
            能说明同步路径下，每次 input 都会触发一次重算（User Timing 多条）。
          </li>
          <li>能说明防抖路径下，快速输入时重算次数远少于键入次数。</li>
          <li>
            能口述：输入卡顿常来自「高频事件 +
            同步重活」，优化方向包括防抖/节流、延后计算、Web Worker 等。
          </li>
        </ul>
      </section>

      <section>
        <h2>定位不到自己的代码时</h2>
        <ol className="steps">
          <li>
            在 User Timing 里搜 <code>lesson3-input-sync-duration</code> 或{" "}
            <code>lesson3-input-deferred-duration</code>。
          </li>
          <li>
            Bottom-up 里按 URL 分组，优先看本站脚本，忽略扩展的 content script。
          </li>
          <li>需要干净环境时用无痕窗口（默认不装扩展）再录。</li>
        </ol>
      </section>
    </main>
  );
}
