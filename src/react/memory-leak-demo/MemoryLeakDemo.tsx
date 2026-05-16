import { useEffect, useReducer, useCallback, useState } from "react";
import "./style.css";
import { LESSONS, type LabRegion } from "./curriculum";
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
import { LESSON1_DRAWER_CASE_TITLE, runDrawerScenarioClean, runDrawerScenarioLeaky } from "./lesson1-drawer-case";

function useLeakStatsTick() {
  const [, bump] = useReducer((n: number) => n + 1, 0);
  return bump;
}

function labClass(active: LabRegion[], region: LabRegion): string {
  return active.includes(region) ? "lab-section lab-focused" : "lab-section";
}

/** 卸载后仍保留 resize 监听、定时器、Detached DOM 引用 */
function LeakyMountChild({ label }: { label: string }) {
  useEffect(() => {
    const onResize = () => undefined;
    registerLeakyListener({ target: window, type: "resize", handler: onResize });
    startLeakyInterval(2000);

    const el = document.createElement("div");
    el.textContent = `detached-${label}`;
    el.className = "leak-detached-node";
    document.body.appendChild(el);
    document.body.removeChild(el);
    pushDetachedNode(el);
    return undefined;
  }, [label]);

  return <span style={{ marginLeft: 8, color: "#c45c4a" }}>泄漏子组件 ({label})</span>;
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
  return <span style={{ marginLeft: 8, color: "#2d8a56" }}>已清理的子组件</span>;
}

export default function MemoryLeakDemo() {
  const bumpStats = useLeakStatsTick();
  const [lessonIdx, setLessonIdx] = useState(0);
  const [mountLeakChild, setMountLeakChild] = useState(false);
  const [leakKey, setLeakKey] = useState(0);
  const [mountCleanChild, setMountCleanChild] = useState(false);

  const refresh = useCallback(() => bumpStats(), [bumpStats]);
  const lesson = LESSONS[lessonIdx];
  const focus = lesson.focus;

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
    [refresh]
  );

  return (
    <div className="memory-leak-demo">
      <h1>Chrome 内存泄漏 · 5 课上手</h1>
      <p className="sub">
        配合 DevTools <strong>Memory → Heap snapshot</strong>，按课切换讲义；下方实验区会用<strong>蓝色描边</strong>标出本课主要操作的区域。
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
              onClick={() => setLessonIdx((i) => Math.min(LESSONS.length - 1, i + 1))}
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
        <strong>实验区</strong>（本课相关区块已高亮）：所有按钮全局共用，切换课程只会改变讲义与高亮，不会清空已制造的泄漏。
      </p>

      <section className={labClass(focus, "stats")}>
        <h2 className="lab-heading">
          计数与刷新 <span className="lab-tag">第 1 课常用</span>
        </h2>
        <div className="stats">
          <div className="stat">eventListeners: {leakCounters.eventListeners}</div>
          <div className="stat">intervals: {leakCounters.intervals}</div>
          <div className="stat">detachedDomRefs: {detachedDomNodes.length}</div>
          <div className="stat">~1MB strings: {leakCounters.millionCharStrings}</div>
        </div>
        <div className="btn-row">
          <button type="button" onClick={refresh}>
            刷新计数显示
          </button>
        </div>

        <div className="lesson1-case">
          <h3 className="lesson1-case-title">第一课配套案例：{LESSON1_DRAWER_CASE_TITLE}</h3>
          <p className="hint lesson1-case-lead">
            用<strong>同一套 Comparison 流程</strong>先后跑「干净实现」和「泄漏实现」：泄漏版在计数区会看到{" "}
            <code>eventListeners</code>、<code>detachedDomRefs</code> 随次数线性上升；干净版应保持为 0。再把这种差异对照到 Heap
            Comparison 里的 # New / Retained。
          </p>
          <ol className="steps lesson1-case-steps">
            <li>
              点<strong>重置案例环境</strong>（会清空本 demo 登记的监听、Detached、字符串等）。
            </li>
            <li>回到列表稳定态 → 拍 <strong>Snapshot A</strong>。</li>
            <li>
              点<strong>干净：开关抽屉 ×15</strong> → 再拍 <strong>Snapshot B</strong> → 用 B 对比 A（第一课核心动作）。
            </li>
            <li>再次点<strong>重置案例环境</strong> → 拍 <strong>Snapshot A′</strong>。</li>
            <li>
              点<strong>泄漏：开关抽屉 ×15</strong> → 拍 <strong>Snapshot B′</strong> → 对比 A′；此时页面计数与快照里的累积信号应对得上。
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

      <section className={labClass(focus, "react")}>
        <h2 className="lab-heading">
          React 挂载 / 卸载 <span className="lab-tag">第 5 课核心</span>
        </h2>
        <p className="hint">
          泄漏子组件在卸载时<strong>不</strong>移除监听与定时器，并把已从文档移除的 DOM 放进全局数组。
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
          <button type="button" className="danger" onClick={() => runLeakCycles(5)}>
            连续挂载/卸载 5 次
          </button>
          <button type="button" className="danger" onClick={() => runLeakCycles(20)}>
            连续挂载/卸载 20 次
          </button>
        </div>
        <div style={{ marginTop: 12 }}>
          {mountLeakChild ? <LeakyMountChild label={String(leakKey)} /> : <span>（未挂载泄漏子组件）</span>}
        </div>
        <p className="hint">对照：卸载时会 removeEventListener + clearInterval。</p>
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
        <div style={{ marginTop: 8 }}>{mountCleanChild ? <CleanMountChild /> : null}</div>
      </section>

      <section className={labClass(focus, "manual")}>
        <h2 className="lab-heading">
          手动制造泄漏 <span className="lab-tag">第 2～4 课</span>
        </h2>
        <div className="btn-row">
          <button
            type="button"
            className="danger"
            onClick={() => {
              const fn = () => undefined;
              registerLeakyListener({ target: document, type: "click", handler: fn });
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

      <section className={labClass(focus, "fix")}>
        <h2 className="lab-heading">
          修复 / 释放 <span className="lab-tag">每课对照用</span>
        </h2>
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
        <p className="hint">
          干净子组件上的 scroll 监听仅在其卸载时释放；全局泄漏请用上方按钮验证修复前后快照差异。
        </p>
      </section>
    </div>
  );
}
