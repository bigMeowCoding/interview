import { useCallback, useReducer, useState } from "react";
import "./style.css";
import {
  lessonOneStats,
  resetLessonOneStats,
  runBaselineInteractionBatch,
  runHeavyInteractionBatch,
} from "./state";

function useRerenderTick() {
  const [, bump] = useReducer((n: number) => n + 1, 0);
  return bump;
}

export default function PerformancePanelDemo() {
  const refresh = useRerenderTick();
  const [lastHint, setLastHint] = useState("先跑一次 Baseline 录制");

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
        用同样操作路径对比 Main 线程耗时差异。当前 Heavy 会刻意制造可见长任务。
      </p>

      <section>
        <h2>操作步骤（跟着做）</h2>
        <ol className="steps">
          <li>打开 DevTools → Performance，点击 Record 开始录制。</li>
          <li>点击「Baseline：轻量交互批量执行」一次，然后 Stop。</li>
          <li>再次 Record，点击「Heavy：主线程压力批量执行」一次，然后 Stop。</li>
          <li>在两段录制里框选交互区间，比较 Main 线程耗时和长任务长度。</li>
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
        <div className="stat">总交互次数：{lessonOneStats.totalInteractions}</div>
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
        </ul>
      </section>
    </main>
  );
}
