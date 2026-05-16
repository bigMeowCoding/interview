import { useEffect, useReducer, useCallback, useState } from "react";
import "./style.css";
import { LESSONS } from "./curriculum";
import {
  leakCounters,
  detachedDomNodes,
  pushDetachedNode,
  leakHugeString,
  clearHugeStrings,
  startLeakyInterval,
  clearAllLeakyIntervals,
  registerLeakyListener,
  removeAllLeakyListeners,
  resetLeakDemoState,
} from "./state";
import {
  LESSON1_DRAWER_CASE_TITLE,
  runDrawerScenarioClean,
  runDrawerScenarioLeaky,
} from "./lesson1-drawer-case";
import {
  LESSON2_DETACHED_CASE_TITLE,
  runDetachedScenarioClean,
  runDetachedScenarioLeaky,
} from "./lesson2-detached-case";
import {
  LESSON3_LISTENERS_INTERVAL_CASE_TITLE,
  runListenersIntervalScenarioClean,
  runListenersIntervalScenarioLeaky,
} from "./lesson3-listeners-interval-case";
import {
  LESSON4_HUGE_STRING_CASE_TITLE,
  runHugeStringScenarioClean,
  runHugeStringScenarioLeaky,
} from "./lesson4-huge-string-case";
import {
  LESSON5_REACT_CASE_TITLE,
  runReactCleanScenarioBatch,
  runReactLeakScenarioBatch,
  simulateLeakyMountChildEffect,
} from "./lesson5-react-case";

function readInitialLessonIdx(): number {
  if (typeof window === "undefined") {
    return 0;
  }
  const raw = new URLSearchParams(window.location.search).get("lesson");
  const n = raw != null ? Number.parseInt(raw, 10) : NaN;
  if (Number.isFinite(n) && n >= 1 && n <= LESSONS.length) {
    return n - 1;
  }
  return 0;
}

function useLeakStatsTick() {
  const [, bump] = useReducer((n: number) => n + 1, 0);
  return bump;
}

/** 卸载后仍保留 resize 监听、定时器、Detached DOM 引用 */
function LeakyMountChild({ label }: { label: string }) {
  useEffect(() => {
    simulateLeakyMountChildEffect(label);
    return undefined;
  }, [label]);

  return (
    <span style={{ marginLeft: 8, color: "#c45c4a" }}>
      泄漏子组件 ({label})
    </span>
  );
}

/** 对照：useEffect 清理监听与定时器 */
function CleanMountChild() {
  useEffect(() => {
    const onScroll = () => undefined;
    window.addEventListener("scroll", onScroll, { passive: true });
    const id = window.setInterval(() => undefined, 3000);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.clearInterval(id);
    };
  }, []);
  return (
    <span style={{ marginLeft: 8, color: "#2d8a56" }}>已清理的子组件</span>
  );
}

export default function MemoryLeakDemo() {
  const bumpStats = useLeakStatsTick();
  const [lessonIdx, setLessonIdx] = useState(readInitialLessonIdx);
  const [mountLeakChild, setMountLeakChild] = useState(false);
  const [leakKey, setLeakKey] = useState(0);
  const [mountCleanChild, setMountCleanChild] = useState(false);

  const refresh = useCallback(() => bumpStats(), [bumpStats]);
  const lesson = LESSONS[lessonIdx];

  const runLeakCycles = useCallback(
    async (n: number) => {
      for (let i = 0; i < n; i++) {
        setLeakKey((k) => k + 1);
        setMountLeakChild(true);
        await new Promise<void>((r) => queueMicrotask(r));
        setMountLeakChild(false);
        await new Promise<void>((r) => queueMicrotask(r));
      }
      refresh();
    },
    [refresh],
  );

  return (
    <div className="memory-leak-demo">
      <h1>Chrome 内存泄漏 · 5 课上手</h1>
      <p className="sub">
        配合 DevTools <strong>Memory → Heap snapshot</strong>
        按课练习；切换课程<strong>只会更换下方实验区与本课讲义</strong>
        ，不会自动清空你已制造的泄漏。URL 示例：<code>?lesson=3</code>
        （监听与定时器）、<code>?lesson=5</code>
        （React）直达对应课。
      </p>

      <nav className="lesson-nav" aria-label="课程切换">
        {LESSONS.map((l, i) => (
          <button
            key={l.index}
            type="button"
            className={i === lessonIdx ? "lesson-tab active" : "lesson-tab"}
            onClick={() => setLessonIdx(i)}
          >
            {l.index}. {l.title.split("·")[1]?.trim() ?? l.title}
          </button>
        ))}
      </nav>

      <article className="lesson-card">
        <header className="lesson-card-head">
          <h2>{lesson.title}</h2>
          <p className="lesson-sub">{lesson.subtitle}</p>
          <div className="lesson-arrows">
            <button
              type="button"
              className="nav-arrow"
              disabled={lessonIdx <= 0}
              onClick={() => setLessonIdx((i) => Math.max(0, i - 1))}
            >
              ← 上一课
            </button>
            <button
              type="button"
              className="nav-arrow"
              disabled={lessonIdx >= LESSONS.length - 1}
              onClick={() =>
                setLessonIdx((i) => Math.min(LESSONS.length - 1, i + 1))
              }
            >
              下一课 →
            </button>
          </div>
        </header>

        <div className="lesson-block">
          <h3>学完你会</h3>
          <ul>
            {lesson.outcomes.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
        </div>

        <div className="lesson-block">
          <h3>Chrome 操作（跟着做）</h3>
          <ol className="steps">
            {lesson.chromeSteps.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ol>
        </div>

        {lesson.realWorldExample ? (
          <div className="lesson-block scenario">
            <h3>实际场景举例</h3>
            <p className="lesson-lab-guide">{lesson.realWorldExample}</p>
          </div>
        ) : null}

        <div className="lesson-block highlight">
          <h3>本课怎么用这个 Demo</h3>
          <p className="lesson-lab-guide">{lesson.labGuide}</p>
          <p className="mini-label">建议顺序</p>
          <ol className="steps compact">
            {lesson.tryThis.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ol>
        </div>

        <div className="lesson-block">
          <h3>自查（能打勾就算过关）</h3>
          <ul className="checklist">
            {lesson.checklist.map((t) => (
              <li key={t}>
                <label>
                  <input type="checkbox" />
                  {t}
                </label>
              </li>
            ))}
          </ul>
        </div>
      </article>

      <p className="lab-intro">
        <strong>实验区</strong>：以下为<strong>当前课专属</strong>
        操作；切课会看到另一套控件，但不会替你清空堆里已登记的泄漏。
        <strong>若要完全归零请刷新本页</strong>。
      </p>

      {lesson.index === 1 ? (
        <section className="lab-section lab-focused">
          <h2 className="lab-heading">实验区 · 第一课</h2>
          <p className="hint lesson-lab-scope">
            关注抽屉案例带来的<strong>监听与 Detached DOM</strong>
            计数；其它类型泄漏在后续课单独练习。
          </p>
          <div className="stats lesson-stats-subset">
            <div className="stat">
              eventListeners: {leakCounters.eventListeners}
            </div>
            <div className="stat">
              detachedDomRefs: {detachedDomNodes.length}
            </div>
          </div>
          <div className="btn-row">
            <button type="button" onClick={refresh}>
              刷新计数显示
            </button>
          </div>

          <div className="lesson-case-block">
            <h3 className="lesson1-case-title">
              第一课配套案例：{LESSON1_DRAWER_CASE_TITLE}
            </h3>
            <p className="hint lesson1-case-lead">
              用<strong>同一套 Comparison 流程</strong>
              先后跑「干净实现」和「泄漏实现」：泄漏版在计数区会看到{" "}
              <code>eventListeners</code>、<code>detachedDomRefs</code>{" "}
              随次数线性上升；干净版应保持为 0。再把这种差异对照到 Heap
              Comparison 里的 # New / Retained。
            </p>
            <ol className="steps lesson1-case-steps">
              <li>
                点<strong>重置案例环境</strong>（会清空本 demo
                登记的监听、Detached、interval、字符串等）。
              </li>
              <li>
                回到列表稳定态 → 拍 <strong>Snapshot A</strong>。
              </li>
              <li>
                点<strong>干净：开关抽屉 ×15</strong> → 再拍{" "}
                <strong>Snapshot B</strong> → 用 B 对比 A（第一课核心动作）。
              </li>
              <li>
                再次点<strong>重置案例环境</strong> → 拍{" "}
                <strong>Snapshot A′</strong>。
              </li>
              <li>
                点<strong>泄漏：开关抽屉 ×15</strong> → 拍{" "}
                <strong>Snapshot B′</strong> → 对比
                A′；此时页面计数与快照里的累积信号应对得上。
              </li>
            </ol>
            <div className="btn-row">
              <button
                type="button"
                className="fix"
                onClick={() => {
                  resetLeakDemoState();
                  refresh();
                }}
              >
                重置案例环境
              </button>
              <button
                type="button"
                onClick={() => {
                  runDrawerScenarioClean(15);
                  refresh();
                }}
              >
                干净：开关抽屉 ×15
              </button>
              <button
                type="button"
                className="danger"
                onClick={() => {
                  runDrawerScenarioLeaky(15);
                  refresh();
                }}
              >
                泄漏：开关抽屉 ×15
              </button>
            </div>
          </div>
        </section>
      ) : null}

      {lesson.index === 5 ? (
        <>
          <section className="lab-section lab-focused">
            <h2 className="lab-heading">实验区 · 第五课 · 计数与配套案例</h2>
            <p className="hint lesson-lab-scope">
              泄漏<strong>挂载副作用</strong>每发生一次，
              <code>eventListeners</code>、<code>intervals</code>、
              <code>detachedDomRefs</code> 各 +1（本课不涉及大字符串）。
            </p>
            <div className="stats lesson-stats-subset">
              <div className="stat">
                eventListeners: {leakCounters.eventListeners}
              </div>
              <div className="stat">intervals: {leakCounters.intervals}</div>
              <div className="stat">
                detachedDomRefs: {detachedDomNodes.length}
              </div>
            </div>
            <div className="btn-row">
              <button type="button" onClick={refresh}>
                刷新计数显示
              </button>
            </div>

            <div className="lesson-case-block lesson5-case-alone">
              <h3 className="lesson5-case-title">
                第五课配套案例：{LESSON5_REACT_CASE_TITLE}
              </h3>
              <p className="hint lesson5-case-lead">
                与第 2～4 课同样做两轮{" "}
                <strong>A → 操作 → B → Comparison</strong>
                。下方按钮是<strong>纯函数批量</strong>
                ，与泄漏子组件的单次 <code>useEffect</code> 登记逻辑一致，且
                <strong>每轮只累加一回</strong>
                （避免开发态 Strict Mode 对「真实挂载」的双调用干扰读数）。
                跑完再配合下方真实子组件挂载体验路由级场景。
              </p>
              <ol className="steps lesson5-case-steps">
                <li>
                  点<strong>重置案例环境</strong>
                  （会清空监听、Detached、interval、字符串等）。
                </li>
                <li>
                  拍 <strong>Snapshot A</strong>。
                </li>
                <li>
                  <strong>干净：cleanup 对等 ×15</strong> → Snapshot B；
                  三项计数应仍为 <strong>0</strong>。
                </li>
                <li>
                  <strong>重置案例环境</strong> → Snapshot A′ →{" "}
                  <strong>泄漏：等价挂载副作用 ×15</strong> → Snapshot B′， 在
                  Comparison 里结合前几课搜监听、interval、Detached。
                </li>
                <li>Unmount 后可用修复区逐项清理，验证回落。</li>
              </ol>
              <div className="btn-row">
                <button
                  type="button"
                  className="fix"
                  onClick={() => {
                    resetLeakDemoState();
                    refresh();
                  }}
                >
                  重置案例环境
                </button>
                <button
                  type="button"
                  onClick={() => {
                    runReactCleanScenarioBatch(15);
                    refresh();
                  }}
                >
                  干净：cleanup 对等 ×15
                </button>
                <button
                  type="button"
                  className="danger"
                  onClick={() => {
                    runReactLeakScenarioBatch(15);
                    refresh();
                  }}
                >
                  泄漏：等价挂载副作用 ×15
                </button>
              </div>
            </div>
          </section>

          <section className="lab-section lab-focused">
            <h2 className="lab-heading">
              实验区 · React 真实挂载 / 卸载（进阶）
            </h2>
            <p className="hint">
              泄漏子组件在卸载时<strong>不</strong>
              移除监听与定时器，并把已从文档移除的 DOM 放进全局数组。
            </p>
            <div className="btn-row">
              <button
                type="button"
                className="danger"
                onClick={() => {
                  setMountLeakChild((v) => !v);
                  refresh();
                }}
              >
                {mountLeakChild ? "卸载泄漏子组件" : "挂载泄漏子组件"}
              </button>
              <button
                type="button"
                className="danger"
                onClick={() => runLeakCycles(5)}
              >
                连续挂载/卸载 5 次
              </button>
              <button
                type="button"
                className="danger"
                onClick={() => runLeakCycles(20)}
              >
                连续挂载/卸载 20 次
              </button>
            </div>
            <div style={{ marginTop: 12 }}>
              {mountLeakChild ? (
                <LeakyMountChild label={String(leakKey)} />
              ) : (
                <span>（未挂载泄漏子组件）</span>
              )}
            </div>
            <p className="hint">
              对照：卸载时会 removeEventListener + clearInterval。
            </p>
            <div className="btn-row">
              <button
                type="button"
                onClick={() => {
                  setMountCleanChild((v) => !v);
                  refresh();
                }}
              >
                {mountCleanChild ? "卸载干净子组件" : "挂载干净子组件"}
              </button>
            </div>
            <div style={{ marginTop: 8 }}>
              {mountCleanChild ? <CleanMountChild /> : null}
            </div>
          </section>

          <section className="lab-section lab-focused">
            <h2 className="lab-heading">实验区 · 修复（对照快照回落）</h2>
            <p className="hint">
              Unmount
              泄漏子组件后，用下列按钮逐项释放堆里仍登记的引用，再拍快照对比。
            </p>
            <div className="btn-row">
              <button
                type="button"
                className="fix"
                onClick={() => {
                  removeAllLeakyListeners();
                  refresh();
                }}
              >
                移除本 Demo 登记的监听
              </button>
              <button
                type="button"
                className="fix"
                onClick={() => {
                  clearAllLeakyIntervals();
                  refresh();
                }}
              >
                clear 本 Demo 登记的 interval
              </button>
              <button
                type="button"
                className="fix"
                onClick={() => {
                  detachedDomNodes.length = 0;
                  leakCounters.detachedDomRegistered = 0;
                  refresh();
                }}
              >
                清空 Detached DOM 引用数组
              </button>
            </div>
          </section>
        </>
      ) : null}

      {lesson.index === 2 ? (
        <>
          <section className="lab-section lab-focused">
            <h2 className="lab-heading">实验区 · 第二课 · Detached DOM</h2>
            <p className="hint lesson-lab-scope">
              本课<strong>只看</strong>
              已从文档移除、仍被演示数组持有的节点计数。
            </p>
            <div className="stats lesson-stats-subset">
              <div className="stat">
                detachedDomRefs: {detachedDomNodes.length}
              </div>
            </div>
            <div className="btn-row">
              <button type="button" onClick={refresh}>
                刷新计数显示
              </button>
            </div>

            <div className="lesson-case-block lesson2-case-alone">
              <h3 className="lesson2-case-title">
                第二课配套案例：{LESSON2_DETACHED_CASE_TITLE}
              </h3>
              <p className="hint lesson2-case-lead">
                与第一课类似做两轮 <strong>A → 操作 → B → Comparison</strong>
                ，但这里<strong>只动 DOM 引用</strong>
                ，便于在快照里单独搜索 <code>Detached</code> /{" "}
                <code>HTMLDivElement</code>。页面计数{" "}
                <code>detachedDomRefs</code> 应与泄漏次数一致。
              </p>
              <ol className="steps lesson2-case-steps">
                <li>
                  点<strong>重置案例环境</strong>
                  （会清空监听、Detached、interval、字符串等）。
                </li>
                <li>
                  拍 <strong>Snapshot A</strong>。
                </li>
                <li>
                  <strong>干净：仅挂载卸下 ×15</strong> → 拍{" "}
                  <strong>Snapshot B</strong> → Comparison(A,B)；detached 应为{" "}
                  <strong>0</strong>。
                </li>
                <li>
                  再点<strong>重置案例环境</strong> → 拍{" "}
                  <strong>Snapshot A′</strong>。
                </li>
                <li>
                  <strong>泄漏：Detached 引用 ×15</strong> → 拍{" "}
                  <strong>Snapshot B′</strong> → Comparison(A′,B′)，再搜
                  Detached 展开 retaining path。
                </li>
                <li>
                  点击下方<strong>清空 Detached DOM 引用数组</strong>
                  ，可选再拍 Snapshot C。
                </li>
              </ol>
              <div className="btn-row">
                <button
                  type="button"
                  className="fix"
                  onClick={() => {
                    resetLeakDemoState();
                    refresh();
                  }}
                >
                  重置案例环境
                </button>
                <button
                  type="button"
                  onClick={() => {
                    runDetachedScenarioClean(15);
                    refresh();
                  }}
                >
                  干净：仅挂载卸下 ×15
                </button>
                <button
                  type="button"
                  className="danger"
                  onClick={() => {
                    runDetachedScenarioLeaky(15);
                    refresh();
                  }}
                >
                  泄漏：Detached 引用 ×15
                </button>
              </div>
            </div>

            <div className="btn-row">
              <button
                type="button"
                className="danger"
                onClick={() => {
                  const el = document.createElement("div");
                  el.textContent = "manual-detached";
                  document.body.appendChild(el);
                  document.body.removeChild(el);
                  pushDetachedNode(el);
                  refresh();
                }}
              >
                制造 Detached DOM 并保留引用
              </button>
            </div>
          </section>

          <section className="lab-section lab-focused">
            <h2 className="lab-heading">实验区 · 修复 Detached</h2>
            <div className="btn-row">
              <button
                type="button"
                className="fix"
                onClick={() => {
                  detachedDomNodes.length = 0;
                  leakCounters.detachedDomRegistered = 0;
                  refresh();
                }}
              >
                清空 Detached DOM 引用数组
              </button>
            </div>
          </section>
        </>
      ) : null}

      {lesson.index === 3 ? (
        <>
          <section className="lab-section lab-focused">
            <h2 className="lab-heading">实验区 · 第三课 · 监听与定时器</h2>
            <p className="hint lesson-lab-scope">
              计数器应对齐本课点的「未移除监听」与「未 clear 的
              interval」次数（配套案例泄漏轮每迭代各 +1）。
            </p>
            <div className="stats lesson-stats-subset">
              <div className="stat">
                eventListeners: {leakCounters.eventListeners}
              </div>
              <div className="stat">intervals: {leakCounters.intervals}</div>
            </div>
            <div className="btn-row">
              <button type="button" onClick={refresh}>
                刷新计数显示
              </button>
            </div>

            <div className="lesson-case-block lesson3-case-alone">
              <h3 className="lesson3-case-title">
                第三课配套案例：{LESSON3_LISTENERS_INTERVAL_CASE_TITLE}
              </h3>
              <p className="hint lesson3-case-lead">
                两轮 <strong>A → 操作 → B → Comparison</strong>
                ：泄漏轮每迭代 <code>eventListeners</code> 与{" "}
                <code>intervals</code>
                <strong>等量齐升</strong>；干净轮两者保持 <strong>0</strong>。
              </p>
              <ol className="steps lesson3-case-steps">
                <li>
                  <strong>重置案例环境</strong> → 拍 <strong>Snapshot A</strong>
                  。
                </li>
                <li>
                  <strong>干净：同步注册并清理 ×15</strong> → 拍 Snapshot B。
                </li>
                <li>
                  <strong>重置案例环境</strong> → Snapshot A′ →{" "}
                  <strong>泄漏：监听+interval ×15</strong> → Snapshot B′。
                </li>
              </ol>
              <div className="btn-row">
                <button
                  type="button"
                  className="fix"
                  onClick={() => {
                    resetLeakDemoState();
                    refresh();
                  }}
                >
                  重置案例环境
                </button>
                <button
                  type="button"
                  onClick={() => {
                    runListenersIntervalScenarioClean(15);
                    refresh();
                  }}
                >
                  干净：同步注册并清理 ×15
                </button>
                <button
                  type="button"
                  className="danger"
                  onClick={() => {
                    runListenersIntervalScenarioLeaky(15);
                    refresh();
                  }}
                >
                  泄漏：监听+interval ×15
                </button>
              </div>
            </div>

            <div className="btn-row">
              <button
                type="button"
                className="danger"
                onClick={() => {
                  const fn = () => undefined;
                  registerLeakyListener({
                    target: document,
                    type: "click",
                    handler: fn,
                  });
                  refresh();
                }}
              >
                document 上多加一个 click 监听（不清理）
              </button>
              <button
                type="button"
                className="danger"
                onClick={() => {
                  startLeakyInterval(1500);
                  refresh();
                }}
              >
                新建 setInterval（不清理）
              </button>
            </div>
          </section>

          <section className="lab-section lab-focused">
            <h2 className="lab-heading">实验区 · 移除监听 / 清理定时器</h2>
            <div className="btn-row">
              <button
                type="button"
                className="fix"
                onClick={() => {
                  removeAllLeakyListeners();
                  refresh();
                }}
              >
                移除本 Demo 登记的监听
              </button>
              <button
                type="button"
                className="fix"
                onClick={() => {
                  clearAllLeakyIntervals();
                  refresh();
                }}
              >
                clear 本 Demo 登记的 interval
              </button>
            </div>
          </section>
        </>
      ) : null}

      {lesson.index === 4 ? (
        <>
          <section className="lab-section lab-focused">
            <h2 className="lab-heading">实验区 · 第四课 · 大字符串</h2>
            <p className="hint lesson-lab-scope">
              泄漏路径每次向全局数组<strong>再放入约 1MB</strong>
              量级的字符串副本；干净路径仅做同等分配、不写入缓存。页面{" "}
              <code>~1MB strings</code> 应与「泄漏」次数对齐，便于对照 Heap 里
              Retained 排序。
            </p>
            <details className="concept-note">
              <summary>术语：Shallow size 与 Retained size</summary>
              <div className="concept-note-body">
                <p>
                  <strong>Shallow（浅层）</strong>
                  ：多指<strong>这个节点自己</strong>
                  占多少字节，一般不把引用出去的大对象算进来。
                </p>
                <p>
                  <strong>Retained（保留）</strong>
                  ：多指「若这一支引用链解放，能连带回收多少」——常记成
                  <strong>自身 + 仅通过它能活命的那团</strong>
                  ；若大块还被别处引用，责任会分摊到别的路径上。
                </p>
                <p>
                  排查泄漏时优先看
                  <strong> Retained / Delta 排序</strong>
                  ，易抓到「入口小却牵着整坨」的元凶，再读 retaining path。
                </p>
                <p className="concept-note-ref">
                  完整表述见仓库{" "}
                  <code>.ai/specs/chrome-memory-leak-course.spec.md</code> 第 4
                  课「知识点」。
                </p>
              </div>
            </details>
            <div className="stats lesson-stats-subset">
              <div className="stat">
                ~1MB strings: {leakCounters.millionCharStrings}
              </div>
            </div>
            <div className="btn-row">
              <button type="button" onClick={refresh}>
                刷新计数显示
              </button>
            </div>

            <div className="lesson-case-block lesson4-case-alone">
              <h3 className="lesson4-case-title">
                第四课配套案例：{LESSON4_HUGE_STRING_CASE_TITLE}
              </h3>
              <p className="hint lesson4-case-lead">
                两轮 <strong>A → 操作 → B → Comparison</strong>
                ：泄漏轮页面计数随次数上升；干净轮<strong>不增加</strong>{" "}
                <code>~1MB strings</code>。再在快照里按 Retained / Delta
                排序找大块， retaining path 应对上本 demo 全局数组。
              </p>
              <ol className="steps lesson4-case-steps">
                <li>
                  <strong>重置案例环境</strong> → 拍 <strong>Snapshot A</strong>
                  。
                </li>
                <li>
                  <strong>干净：临时大字符串 ×15</strong>（不写入全局缓存）→ 拍
                  Snapshot B → Comparison；<code>~1MB strings</code> 应为{" "}
                  <strong>0</strong>。
                </li>
                <li>
                  <strong>重置案例环境</strong> → Snapshot A′ →
                  <strong> 泄漏：缓存 ~1MB 字符串 ×15</strong> → Snapshot B′。
                </li>
                <li>
                  （可选）多次点下方单次泄漏，或点
                  <strong>清空大字符串缓存</strong>
                  后验证回落。
                </li>
              </ol>
              <div className="btn-row">
                <button
                  type="button"
                  className="fix"
                  onClick={() => {
                    resetLeakDemoState();
                    refresh();
                  }}
                >
                  重置案例环境
                </button>
                <button
                  type="button"
                  onClick={() => {
                    runHugeStringScenarioClean(15);
                    refresh();
                  }}
                >
                  干净：临时大字符串 ×15
                </button>
                <button
                  type="button"
                  className="danger"
                  onClick={() => {
                    runHugeStringScenarioLeaky(15);
                    refresh();
                  }}
                >
                  泄漏：缓存 ~1MB 字符串 ×15
                </button>
              </div>
            </div>

            <div className="btn-row">
              <button
                type="button"
                className="danger"
                onClick={() => {
                  leakHugeString();
                  refresh();
                }}
              >
                泄漏 ~1MB 字符串（数组持有）
              </button>
            </div>
          </section>

          <section className="lab-section lab-focused">
            <h2 className="lab-heading">实验区 · 清空字符串缓存</h2>
            <div className="btn-row">
              <button
                type="button"
                className="fix"
                onClick={() => {
                  clearHugeStrings();
                  refresh();
                }}
              >
                清空大字符串缓存
              </button>
            </div>
          </section>
        </>
      ) : null}
    </div>
  );
}
