import { memo, useEffect, useState } from "react";
import { runLesson5ChildRenderWork } from "./state";

/** 与父组件 setInterval 对齐：数值越大单次录制里子渲染次数越少，可按机器调整。 */
export const LESSON5_PARENT_TICK_MS = 380;

/** 糟糕：父组件高频 tick 传给子组件 → 子每次渲染都跑重活。 */
function UnstableHeavyChild({ tick }: { tick: number }) {
  runLesson5ChildRenderWork("bad");
  return (
    <span className="lesson5-child-tag bad">
      子组件随 tick 重算（当前 tick={tick}）
    </span>
  );
}

export function Lesson5BadBlock() {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const id = window.setInterval(
      () => setTick((t) => t + 1),
      LESSON5_PARENT_TICK_MS,
    );
    return () => window.clearInterval(id);
  }, []);

  return (
    <div className="lesson5-scenario bad">
      <p>
        父组件 tick：<strong>{tick}</strong>，已传入子组件 → 每次变化子组件都会{" "}
        <code>render</code> 并执行重活。
      </p>
      <UnstableHeavyChild tick={tick} />
    </div>
  );
}

/** 对照：<code>memo</code> + 不把高频 state 作为 props 传入 → 子几乎不重算。 */
const StableHeavyChild = memo(function StableHeavyChild({
  label,
}: {
  label: string;
}) {
  runLesson5ChildRenderWork("good");
  return (
    <span className="lesson5-child-tag good">子组件 stable label=&quot;{label}&quot;</span>
  );
});

export function Lesson5GoodBlock() {
  const [tick, setTick] = useState(0);
  const label = "demo-stable";

  useEffect(() => {
    const id = window.setInterval(
      () => setTick((t) => t + 1),
      LESSON5_PARENT_TICK_MS,
    );
    return () => window.clearInterval(id);
  }, []);

  return (
    <div className="lesson5-scenario good">
      <p>
        父组件 tick：<strong>{tick}</strong>，<strong>未</strong>传给子 → 子组件 props
        不变，<code>memo</code> 跳过更新。
      </p>
      <StableHeavyChild label={label} />
    </div>
  );
}
