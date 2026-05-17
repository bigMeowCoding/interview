import { useCallback, useState } from "react";
import "./style.css";
import {
  LESSON5_PARENT_TICK_MS,
  Lesson5BadBlock,
  Lesson5GoodBlock,
} from "./Lesson5Scenarios";
import { lessonOneStats, resetLessonOneStats } from "./state";

type Lesson5Mode = "idle" | "bad" | "good";

export default function PerformancePanelDemo() {
  const [mode, setMode] = useState<Lesson5Mode>("idle");
  const [hint, setHint] = useState(
    "先录「糟糕场景」约 3～5 秒再 Stop；重置后再录「对照场景」同样时长。",
  );

  const chooseBad = useCallback(() => {
    resetLessonOneStats();
    setMode("bad");
    setHint(
      "已挂载糟糕场景：User Timing 里应出现大量 lesson5-bad-child-render。录制结束后可看「糟糕路径重活次数」。",
    );
  }, []);

  const chooseGood = useCallback(() => {
    resetLessonOneStats();
    setMode("good");
    setHint(
      "已挂载对照场景：lesson5-good-child-render 应极少（开发态 React StrictMode 可能多 1～2 次 mount）。",
    );
  }, []);

  const stopAll = useCallback(() => {
    setMode("idle");
    resetLessonOneStats();
    setHint("已停止并清空统计，可重新开始录制流程。");
  }, []);

  return (
    <main className="performance-panel-demo">
      <h1>Chrome Performance · 第五课</h1>
      <p className="sub">
        <strong>React：</strong>
        父组件高频 <code>setState</code> 时，子组件若每次跟着{" "}
        <code>render</code> 做同步重活，会在 Main 线程上堆出密集短任务；用{" "}
        <code>memo</code> 与<strong>稳定的 props</strong>（不把 tick
        传下去）可大幅削减无效渲染。
      </p>

      <section>
        <h2>跟着做</h2>
        <ol className="steps">
          <li>
            Performance → Record → 点「挂载糟糕场景」→ 让页面跑 3～5 秒 → Stop。
          </li>
          <li>
            点「停止并重置」→ 再 Record → 点「挂载对照场景」→ 同样录 3～5 秒 →
            Stop。
          </li>
          <li>
            对比 User Timing：<code>lesson5-bad-child-render</code> 条数 ≫{" "}
            <code>lesson5-good-child-render</code>；并对照下方统计。
          </li>
        </ol>
        <p className="mini-hint">
          父组件定时器间隔 {LESSON5_PARENT_TICK_MS}
          ms；与源码 <code>LESSON5_PARENT_TICK_MS</code> 一致。
        </p>
      </section>

      <section className="lesson3-lab">
        <h2>实验区</h2>
        <div className="btn-row lesson3-demo-burst">
          <button
            type="button"
            className="danger"
            disabled={mode === "bad"}
            onClick={chooseBad}
          >
            挂载糟糕场景（录制先用这个）
          </button>
          <button
            type="button"
            className="secondary"
            disabled={mode === "good"}
            onClick={chooseGood}
          >
            挂载对照场景（memo + 稳定 props）
          </button>
          <button type="button" className="fix" onClick={stopAll}>
            停止并重置
          </button>
        </div>

        {mode === "bad" ? <Lesson5BadBlock /> : null}
        {mode === "good" ? <Lesson5GoodBlock /> : null}
        {mode === "idle" ? (
          <p className="hint muted">当前未挂载场景。请选择上方按钮开始。</p>
        ) : null}

        <p className="hint">{hint}</p>
      </section>

      <section className="stats">
        <h2>本课统计</h2>
        <div className="stat">
          糟糕路径子组件重活次数：{lessonOneStats.lesson5BadChildWorkRuns}
        </div>
        <div className="stat">
          对照路径子组件重活次数：{lessonOneStats.lesson5GoodChildWorkRuns}
        </div>
        <div className="stat">最近场景标记：{lessonOneStats.lastScenario}</div>
      </section>

      <section>
        <h2>过关标准</h2>
        <ul className="checklist">
          <li>
            能解释：父组件更新为何会导致子组件 render（props 引用或值变化）。
          </li>
          <li>
            能说明：<code>memo</code> 在什么条件下会跳过更新（props
            浅比较不变）。
          </li>
          <li>能用两次录制说明：减少无效渲染可直接减少主线程脚本压力。</li>
        </ul>
      </section>
    </main>
  );
}
