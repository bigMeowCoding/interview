import "./style.css";
import { Lesson6Integrated } from "./Lesson6Integrated";
import { lessonOneStats } from "./state";

export default function PerformancePanelDemo() {
  return (
    <main className="performance-panel-demo">
      <h1>Chrome Performance · 第六课（综合演练）</h1>
      <p className="sub">
        把前几课的现象<strong>叠在一张「假业务页」里</strong>
        ：无效渲染、输入防抖、布局读写交错。 你要做的是
        <strong>两次完整录制</strong>（问题版 →
        优化版），自己写一份可复现的结论。
      </p>

      <section>
        <h2>任务说明</h2>
        <ol className="steps">
          <li>
            <strong>基准</strong>：Performance → Record → 选中「问题版套件」→
            让页面跑 30～60 秒：在搜索框里随意输入；可点 1～2
            次「交错读写布局」。
          </li>
          <li>
            <strong>复测</strong>：停止 → 选中「优化版套件」→
            再录同样时长，操作尽量一致。
          </li>
          <li>
            <strong>交付物</strong>：按下方「结业清单」填完；保存两次
            trace（可选）或关键截图。
          </li>
        </ol>
      </section>

      <section className="lesson3-lab">
        <h2>综合实验区</h2>
        <Lesson6Integrated />
      </section>

      <section className="stats">
        <h2>统计快照（辅助，以录屏为准）</h2>
        <div className="stat">
          lesson5 糟糕重活：{lessonOneStats.lesson5BadChildWorkRuns} · 对照：{" "}
          {lessonOneStats.lesson5GoodChildWorkRuns}
        </div>
        <div className="stat">
          lesson3 同步搜索次数：{lessonOneStats.inputSyncRuns} · 防抖次数：{" "}
          {lessonOneStats.inputDeferredRuns}
        </div>
        <div className="stat">
          lesson4 交错读写：{lessonOneStats.lesson4ReflowBadRuns} · 先读后写：{" "}
          {lessonOneStats.lesson4ReflowGoodRuns}
        </div>
      </section>

      <section>
        <h2>结业清单（请自拟要点填在笔记里）</h2>
        <ul className="checklist">
          <li>
            <strong>现象</strong>：用户感知是输入卡、动画抖、还是整页停顿？
          </li>
          <li>
            <strong>证据</strong>：Main 上 Scripting / Layout 哪类偏多？User
            Timing 里哪些 measure 条数差异最大？
          </li>
          <li>
            <strong>根因</strong>：对应第几课模型（无效 render / 防抖 /
            强制同步布局）？
          </li>
          <li>
            <strong>方案</strong>：优化版套件分别用了什么手段（可对照源码）？
          </li>
          <li>
            <strong>收益与风险</strong>
            ：同机对比结论；若引入防抖，交互上有什么取舍？
          </li>
          <li>
            <strong>继续优化</strong>：若还要压 INP，你下一步会查什么？
          </li>
        </ul>
      </section>
    </main>
  );
}
