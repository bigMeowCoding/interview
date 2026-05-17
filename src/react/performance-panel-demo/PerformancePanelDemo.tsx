import { useCallback, useRef, useState } from "react";
import "./style.css";
import {
  LESSON4_BOX_COUNT,
  LESSON4_REFLOW_OUTER_LOOPS,
  lessonOneStats,
  resetLessonOneStats,
  runLesson4ForcedReflowBad,
  runLesson4ForcedReflowGood,
} from "./state";

export default function PerformancePanelDemo() {
  const stageRef = useRef<HTMLDivElement | null>(null);
  const [lastHint, setLastHint] = useState(
    "先录「交错读写」，再录「先读后写」，对比 Main 里的 Layout。",
  );
  const [badMs, setBadMs] = useState<number | null>(null);
  const [goodMs, setGoodMs] = useState<number | null>(null);

  const runBad = useCallback(() => {
    const el = stageRef.current;
    if (!el) return;
    const ms = runLesson4ForcedReflowBad(
      el,
      LESSON4_BOX_COUNT,
      LESSON4_REFLOW_OUTER_LOOPS,
    );
    setBadMs(ms);
    setLastHint(
      `交错读写完成：约 ${ms.toFixed(1)}ms。User Timing：lesson4-forced-reflow-bad-duration。`,
    );
  }, []);

  const runGood = useCallback(() => {
    const el = stageRef.current;
    if (!el) return;
    const ms = runLesson4ForcedReflowGood(
      el,
      LESSON4_BOX_COUNT,
      LESSON4_REFLOW_OUTER_LOOPS,
    );
    setGoodMs(ms);
    setLastHint(
      `先读后写完成：约 ${ms.toFixed(1)}ms。User Timing：lesson4-forced-reflow-good-duration。同机对比耗时应低于坏版本。`,
    );
  }, []);

  const reset = useCallback(() => {
    resetLessonOneStats();
    if (stageRef.current) {
      stageRef.current.replaceChildren();
    }
    setBadMs(null);
    setGoodMs(null);
    setLastHint("已重置统计与舞台，可重新录制。");
  }, []);

  return (
    <main className="performance-panel-demo">
      <h1>Chrome Performance · 第四课</h1>
      <p className="sub">
        <strong>Rendering：</strong>
        观察强制同步布局（layout thrashing）。坏代码在循环里交替读 offset 与写
        style；好代码在一轮里先读完再写。
      </p>

      <section>
        <h2>跟着做</h2>
        <ol className="steps">
          <li>
            Performance → Record → 点「交错读写（易抖）」→ Stop。展开 Main，留意
            紫色 <strong>Layout</strong> 是否又碎又长。
          </li>
          <li>
            再录一次 → 点「先读后写（对照）」→
            Stop。对比同机两次「脚本总耗时」与 Layout 密度。
          </li>
          <li>
            User Timing 里搜 <code>lesson4-forced-reflow-bad-duration</code> 与{" "}
            <code>lesson4-forced-reflow-good-duration</code>。
          </li>
        </ol>
      </section>

      <section className="lesson3-lab">
        <h2>实验区</h2>
        <p className="mini-hint">
          参数：{LESSON4_BOX_COUNT} 个节点 × {LESSON4_REFLOW_OUTER_LOOPS}{" "}
          轮；数值与源码中常量一致，可自行调整复现实验。
        </p>
        <div className="btn-row lesson3-demo-burst">
          <button type="button" className="danger" onClick={runBad}>
            交错读写（易抖）— 录制先点这个
          </button>
          <button type="button" className="secondary" onClick={runGood}>
            先读后写（对照）— 再录这个
          </button>
          <button type="button" className="fix" onClick={reset}>
            重置
          </button>
        </div>
        <div
          ref={stageRef}
          className="lesson4-stage"
          aria-label="布局抖动演示节点容器"
        />
        <p className="hint">{lastHint}</p>
        {badMs != null || goodMs != null ? (
          <p className="hint muted">
            本机最近一次：坏版 {badMs != null ? `${badMs.toFixed(1)}ms` : "—"} ·
            好版 {goodMs != null ? `${goodMs.toFixed(1)}ms` : "—"}（以
            Performance 录制为准）
          </p>
        ) : null}
      </section>

      <section className="stats">
        <h2>本课统计</h2>
        <div className="stat">
          交错读写次数：{lessonOneStats.lesson4ReflowBadRuns}
        </div>
        <div className="stat">
          先读后写次数：{lessonOneStats.lesson4ReflowGoodRuns}
        </div>
        <div className="stat">
          最近场景：{lessonOneStats.lastScenario} / 最近耗时：
          {lessonOneStats.lastDurationMs.toFixed(1)}ms
        </div>
      </section>

      <section>
        <h2>过关标准</h2>
        <ul className="checklist">
          <li>能说出「读几何 → 写 style → 再读」为何会反复触发布局。</li>
          <li>能说出优化思路：批量读、批量写、减少强制同步布局。</li>
          <li>能用两次录制作证：好版本 Layout/总耗时应优于坏版本（同机）。</li>
        </ul>
      </section>
    </main>
  );
}
