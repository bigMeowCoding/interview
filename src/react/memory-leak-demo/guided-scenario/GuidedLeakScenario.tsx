import { useCallback, useState } from "react";
import { leakCounters, resetLeakDemoState } from "../state";
import {
  GUIDED_PHASES,
  GUIDED_PREMISE,
  GUIDED_REVEAL_BODY,
  GUIDED_REVEAL_TITLE,
  GUIDED_SCENARIO_TITLE,
} from "./guidedCopy";
import { PromotionRibbon } from "./PromotionRibbon";

import "./guided-scenario.css";

interface GuidedLeakScenarioProps {
  refresh: () => void;
}

export default function GuidedLeakScenario({ refresh }: GuidedLeakScenarioProps) {
  const [hintReveal, setHintReveal] = useState<Record<string, number>>({});
  const [ribbonVisible, setRibbonVisible] = useState(false);

  const bumpHint = useCallback((phaseId: string, max: number) => {
    setHintReveal((prev) => {
      const cur = prev[phaseId] ?? 0;
      return { ...prev, [phaseId]: Math.min(max, cur + 1) };
    });
  }, []);

  return (
    <div className="guided-shell">
      <aside className="guided-rail">
        <h2 className="guided-rail-title">{GUIDED_SCENARIO_TITLE}</h2>
        <p className="guided-premise">{GUIDED_PREMISE}</p>

        <section className="guided-phases">
          {GUIDED_PHASES.map((phase, idx) => {
            const n = hintReveal[phase.id] ?? 0;
            const unlocked = phase.hints.slice(0, n);

            return (
              <details
                key={phase.id}
                className="guided-phase-card"
                open={idx <= 2}
              >
                <summary className="guided-phase-summary">{phase.title}</summary>
                <div className="guided-phase-body">{phase.task}</div>
                {unlocked.map((hint, hi) => (
                  <blockquote
                    key={hi}
                    className={`guided-hint-callout tier-${Math.min(hi + 1, 3)}`}
                  >
                    {hint}
                  </blockquote>
                ))}
                <div className="guided-hint-row">
                  <button
                    type="button"
                    className="guided-hint-btn"
                    onClick={() => bumpHint(phase.id, phase.hints.length)}
                    disabled={n >= phase.hints.length}
                  >
                    {n >= phase.hints.length ? "本节提示已全部给出" : "需要一点提示"}
                  </button>
                  <span className="guided-hint-counter">
                    已解锁 {Math.min(n, phase.hints.length)} /{" "}
                    {phase.hints.length}
                  </span>
                </div>
              </details>
            );
          })}
        </section>

        <details className="guided-reveal-drawer danger-zone">
          <summary>{GUIDED_REVEAL_TITLE}</summary>
          <p>{GUIDED_REVEAL_BODY}</p>
          <pre className="guided-reveal-snippet">
            {EXCERPT_FOR_GUIDE.trimEnd()}
          </pre>
        </details>

        <div className="guided-reset-row">
          <button
            type="button"
            className="fix"
            onClick={() => {
              resetLeakDemoState();
              setRibbonVisible(false);
              refresh();
            }}
          >
            重置本场景登记的泄漏（清计数 + 条幅收起）
          </button>
          <button type="button" onClick={() => refresh()}>
            仅刷新计数显示
          </button>
        </div>

        <p className="guided-footnote muted">
          计数区与课程练习共用演示层 <code>state.ts</code>，便于你看到「堆外登记」的真实形状。
        </p>
      </aside>

      <main className="guided-stage" aria-label="模拟运营后台工作台">
        <header className="fake-admin-bar">
          <span className="fake-logo-badge">OMS</span>
          <nav className="fake-admin-nav muted" aria-hidden>
            概览 · 商品 · <strong>营销中心</strong> · 工单
          </nav>
          <span className="muted">staging</span>
        </header>

        <div className="fake-toolbar">
          <button
            type="button"
            className={ribbonVisible ? "ghost-btn" : "primary-btn"}
            onClick={() => {
              setRibbonVisible(true);
              refresh();
            }}
            disabled={ribbonVisible}
          >
            {ribbonVisible ? "条幅已展开" : "营销 · 展开活动条幅"}
          </button>
          <button
            type="button"
            className="ghost-btn danger-text"
            onClick={() => {
              setRibbonVisible(false);
              refresh();
            }}
            disabled={!ribbonVisible}
          >
            {ribbonVisible ? "收起条幅（Unmount 子组件）" : "（条幅尚未展示）"}
          </button>
        </div>

        <div className="fake-sheet">
          {ribbonVisible ? <PromotionRibbon campaignId="spring-campus-2025" /> : null}

          <h3 className="fake-sheet-heading">营销中心 · 活动排期草稿</h3>
          <p className="muted">
            下方为占位段落，把注意力放在顶部条幅挂载/卸载上即可。
          </p>
          <ul className="fake-data-rows">
            <li>档期 A　待法务</li>
            <li>档期 B　待配置落地页</li>
            <li>档期 C　待开启灰度</li>
          </ul>
        </div>

        <section className="guided-stats-banner" aria-label="演示层泄漏计数参考">
          <span>
            listeners: <strong>{leakCounters.eventListeners}</strong>
          </span>
          <span>
            intervals: <strong>{leakCounters.intervals}</strong>
          </span>
          <span>
            detached: <strong>{leakCounters.detachedDomRegistered}</strong>
          </span>
          <span className="muted">
            引导模式里先把它当「工单辅助读数」，别急着对照课程内容。
          </span>
        </section>
      </main>
    </div>
  );
}

const EXCERPT_FOR_GUIDE =
  `function wirePromoSignalsForCampaign(_campaignId: string): void {\n` +
  `  registerLeakyListener({ target: window, type: \"resize\", ... });\n` +
  `  startLeakyInterval(2000);\n` +
  `  // ... DOM 挂载后摘除并 pushDetachedNode(anchor)\n` +
  `}\n\n` +
  `export function PromotionRibbon(...) {\n` +
  `  useEffect(() => {\n` +
  `    wirePromoSignalsForCampaign(campaignId);\n` +
  `    return undefined;\n` +
  `  }, [campaignId]);\n` +
  `  // ...\n` +
  `}`;
