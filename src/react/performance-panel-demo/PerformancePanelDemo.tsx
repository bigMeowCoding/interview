import { useCallback, useReducer, useState } from "react";
import "./style.css";
import {
  lessonOneStats,
  resetLessonOneStats,
  runBaselineInteractionBatch,
  runChunkedHeavyInteractionBatch,
  runHeavyInteractionBatch,
} from "./state";

function useRerenderTick() {
  const [, bump] = useReducer((n: number) => n + 1, 0);
  return bump;
}

export default function PerformancePanelDemo() {
  const refresh = useRerenderTick();
  const [lastHint, setLastHint] = useState("先跑一次 Baseline 录制");
  const [runningChunked, setRunningChunked] = useState(false);

  const runBaseline = useCallback(() => {
    const duration = runBaselineInteractionBatch();
    setLastHint(`Baseline 完成：本次脚本耗时约 ${duration.toFixed(2)}ms`);
    refresh();
  }, [refresh]);

  const runHeavy = useCallback(() => {
    const duration = runHeavyInteractionBatch();
    setLastHint(`Heavy 完成：本次脚本耗时约 ${duration.toFixed(2)}ms`);
    refresh();
  }, [refresh]);

  const runChunked = useCallback(async () => {
    setRunningChunked(true);
    const duration = await runChunkedHeavyInteractionBatch();
    setLastHint(
      `Chunked 完成：总耗时约 ${duration.toFixed(2)}ms（但长任务会被拆短）`,
    );
    setRunningChunked(false);
    refresh();
  }, [refresh]);

  const reset = useCallback(() => {
    resetLessonOneStats();
    setLastHint("计数已重置，可重新录制 Baseline/Experiment");
    refresh();
  }, [refresh]);

  return (
    <main className="performance-panel-demo">
      <h1>Chrome Performance 第一课：录制基础</h1>
      <p className="sub">
        目标：拿到<strong>可比样本</strong>。先录制 Baseline，再录制 Heavy，
        用同样操作路径对比 Main 线程耗时差异。第二课继续对比阻塞版与分片版。
      </p>

      <section>
        <h2>操作步骤（跟着做）</h2>
        <ol className="steps">
          <li>打开 DevTools → Performance，点击 Record 开始录制。</li>
          <li>点击「Baseline：轻量交互批量执行」一次，然后 Stop。</li>
          <li>
            再次 Record，点击「Heavy：主线程压力批量执行」一次，然后 Stop。
          </li>
          <li>在两段录制里框选交互区间，比较 Main 线程耗时和长任务长度。</li>
        </ol>
      </section>

      <section>
        <h2>第二课：长任务拆分（Chunking）</h2>
        <ol className="steps">
          <li>先录制一次 Heavy（阻塞版）并记住最长任务长度。</li>
          <li>再录制一次 Chunked（分片版），观察 Main 线程变成多段短任务。</li>
          <li>对比两条录制：总耗时可能接近，但交互响应通常更友好。</li>
        </ol>
      </section>

      <section className="actions">
        <h2>实验区</h2>
        <div className="btn-row">
          <button type="button" onClick={runBaseline}>
            Baseline：轻量交互批量执行
          </button>
          <button type="button" className="danger" onClick={runHeavy}>
            Heavy：主线程压力批量执行（含阻塞段）
          </button>
          <button type="button" disabled={runningChunked} onClick={runChunked}>
            {runningChunked
              ? "Chunked 执行中..."
              : "Chunked：分片执行并让出主线程"}
          </button>
          <button type="button" className="fix" onClick={reset}>
            重置统计
          </button>
        </div>
        <p className="hint">{lastHint}</p>
      </section>

      <section className="stats">
        <h2>录制辅助统计</h2>
        <div className="stat">Baseline 次数：{lessonOneStats.baselineRuns}</div>
        <div className="stat">Heavy 次数：{lessonOneStats.heavyRuns}</div>
        <div className="stat">Chunked 次数：{lessonOneStats.chunkedRuns}</div>
        <div className="stat">
          总交互次数：{lessonOneStats.totalInteractions}
        </div>
        <div className="stat">
          最近场景：{lessonOneStats.lastScenario} / 最近耗时：
          {lessonOneStats.lastDurationMs.toFixed(2)}ms
        </div>
      </section>

      <section>
        <h2>本课过关标准</h2>
        <ul className="checklist">
          <li>你能独立完成 Baseline 与 Heavy 两次录制。</li>
          <li>你能在时间轴里框出两段交互区间。</li>
          <li>你能指出 Heavy 相比 Baseline 的主线程耗时上升。</li>
          <li>你能指出 Chunked 把单段长任务拆成多段短任务。</li>
        </ul>
      </section>

      <section>
        <h2>定位不到业务代码时怎么办</h2>
        <ol className="steps">
          <li>
            先在 Performance 里查看 User Timing 轨道，搜索
            lesson1-heavy-duration。
          </li>
          <li>
            在 Bottom-up 里切换 Group by URL，优先看 localhost 源码而非 content
            script。
          </li>
          <li>若仍被插件噪声干扰，先用无痕窗口（禁扩展）再录一遍。</li>
        </ol>
      </section>
    </main>
  );
}
