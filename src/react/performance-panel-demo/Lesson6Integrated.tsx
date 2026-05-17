import { useCallback, useEffect, useRef, useState } from "react";
import { Lesson5BadBlock, Lesson5GoodBlock } from "./Lesson5Scenarios";
import {
  LESSON3_INPUT_DEBOUNCE_MS,
  LESSON4_BOX_COUNT,
  LESSON4_REFLOW_OUTER_LOOPS,
  resetLessonOneStats,
  runInputDeferredSearch,
  runInputSyncSearch,
  runLesson4ForcedReflowBad,
  runLesson4ForcedReflowGood,
} from "./state";

type Kit = "broken" | "fixed";

function BrokenSearchInput() {
  const [value, setValue] = useState("");

  const onChange = (next: string) => {
    setValue(next);
    runInputSyncSearch(next);
  };

  return (
    <label className="lesson6-subcard">
      <span className="lesson6-subcard-title">搜索（同步重算）</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="可快速输入，与优化版对比"
        aria-label="同步搜索输入"
      />
    </label>
  );
}

function FixedSearchInput() {
  const [value, setValue] = useState("");
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current != null) {
        window.clearTimeout(timerRef.current);
      }
    };
  }, []);

  const onChange = (next: string) => {
    setValue(next);
    if (timerRef.current != null) {
      window.clearTimeout(timerRef.current);
    }
    timerRef.current = window.setTimeout(() => {
      runInputDeferredSearch(next);
    }, LESSON3_INPUT_DEBOUNCE_MS);
  };

  return (
    <label className="lesson6-subcard">
      <span className="lesson6-subcard-title">搜索（防抖重算）</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="同上输入节奏"
        aria-label="防抖搜索输入"
      />
    </label>
  );
}

export function Lesson6Integrated() {
  const [kit, setKit] = useState<Kit>("broken");
  const layoutRef = useRef<HTMLDivElement>(null);

  const chooseKit = useCallback((next: Kit) => {
    resetLessonOneStats();
    setKit(next);
  }, []);

  const runLayoutBad = useCallback(() => {
    const el = layoutRef.current;
    if (!el) return;
    runLesson4ForcedReflowBad(
      el,
      LESSON4_BOX_COUNT,
      LESSON4_REFLOW_OUTER_LOOPS,
    );
  }, []);

  const runLayoutGood = useCallback(() => {
    const el = layoutRef.current;
    if (!el) return;
    runLesson4ForcedReflowGood(
      el,
      LESSON4_BOX_COUNT,
      LESSON4_REFLOW_OUTER_LOOPS,
    );
  }, []);

  return (
    <div className="lesson6-wrap">
      <div className="btn-row lesson6-kit-row">
        <button
          type="button"
          className={kit === "broken" ? "danger" : "fix"}
          onClick={() => chooseKit("broken")}
        >
          问题版套件（基准）
        </button>
        <button
          type="button"
          className={kit === "fixed" ? "secondary" : "fix"}
          onClick={() => chooseKit("fixed")}
        >
          优化版套件（复测）
        </button>
      </div>

      <p className="mini-hint">
        两套件互斥：切换时会 <code>resetLessonOneStats()</code>。录制时先固定其一，操作
        30～60 秒（含输入搜索 + 可选点布局按钮）。
      </p>

      {kit === "broken" ? (
        <div className="lesson6-stack">
          <Lesson5BadBlock />
          <BrokenSearchInput />
          <div className="btn-row">
            <button type="button" className="danger" onClick={runLayoutBad}>
              额外：跑一轮交错读写布局（坏）
            </button>
          </div>
        </div>
      ) : (
        <div className="lesson6-stack">
          <Lesson5GoodBlock />
          <FixedSearchInput />
          <div className="btn-row">
            <button type="button" className="secondary" onClick={runLayoutGood}>
              额外：跑一轮先读后写布局（好）
            </button>
          </div>
        </div>
      )}

      <div
        ref={layoutRef}
        className="lesson4-stage lesson6-layout-stage"
        aria-label="布局演示节点容器"
      />
    </div>
  );
}
