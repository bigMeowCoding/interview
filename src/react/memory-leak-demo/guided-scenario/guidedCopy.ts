export const GUIDED_SCENARIO_TITLE = "工作坊 · 营销中心条幅变慢之谜";

export const GUIDED_PREMISE =
  "运维同学反馈：「运营后台在活动页来回开关顶部条幅很多次后，整页变慢，内存曲线也不回落。」你已拿到复现账号，但没源码走查上下文——只能从 DevTools 里先抓证据。";

/** 不包含文件路径关键字，便于读者先独立完成推理 */
export type GuidedPhase = {
  id: string;
  title: string;
  task: string;
  hints: readonly string[];
};

export const GUIDED_PHASES: readonly GuidedPhase[] = [
  {
    id: "repro",
    title: "第 1 步 · 只复现，不猜想",
    task: "在下面模拟后台页面里：连续几次「收起条幅 → 再打开展示」，至少 15 个来回。注意不要刷新整页。若开着 Performance Monitor，可顺便扫一眼 JS Heap 是否在爬升——但此刻先别太依赖它。",
    hints: [
      "每次条幅从「看得见」变为「不可见」，其实对应 React 卸载了一小块子树；按理说相关订阅也应一起释放。若不是，就会留下「Unmount 了的组件，却仍挂在全局监听上」的典型矛盾。",
      "若在 React 18 开发模式下，你可能会看到 Strict Mode 让某些副作用跑一次以上——但「完全缺少 cleanup」在两种环境下都是错误。",
    ],
  },
  {
    id: "snapshot-setup",
    title: "第 2 步 · 给堆留个底账",
    task:
      "在条幅处于「收起」且页面静置几秒后打开 Memory → Heap Snapshot，拍下 Snapshot A。\n\n条幅保持同一状态，不要做其它操作。",
    hints: [
      "Snapshot A 相当于「工单里的现场封存」——后面 Comparison 会一直拿它对比。尽量在 UI 安静下来再拍，杂波更少。",
    ],
  },
  {
    id: "after-repro-snapshot",
    title: "第 3 步 · 回放操作以后再拍一张",
    task:
      "保持 DevTools Memory 面板打开。\n条幅保持收起。\n再从菜单打开展览条幅，重复收起/打出 ≥15 次（与第 1 步类似），静置几秒后拍下 Snapshot B。",
    hints: [
      "第二张要在「和第 1 张相同的 UI 稳态」（例如条幅都收起）下拍——这样堆里多出来的更多是「本应释放却没释放」的证据，而不是正常 UI diff。",
      "若没有明显泄漏，两遍快照会几乎贴在一起；有累积时 Comparison 会看到某些构造器或对象的 # New 与你的操作次数成比例。",
    ],
  },
  {
    id: "comparison",
    title: "第 4 步 · 用 Comparison 读「多出什么类别」",
    task: '选中 Snapshot B，左上角视图改为 Comparison，Baseline 选 Snapshot A。\n在筛选框轮换尝试：Detached、EventListener、闭包函数名/HTML 节点类型等关键字（Chrome 版本不同展示略有差异）。',
    hints: [
      "若条幅内部曾挂过会从文档摘掉但仍被持有的节点，Detached / HTMLAsideElement（或 HTMLElement）有时是突破口。",
      "未被 remove 的 window/document 监听，往往能通过 Native / system 侧的链条看到目标对象还活着。定时器也会让闭包链路保持温热。",
    ],
  },
  {
    id: "retaining-path",
    title: "第 5 步 · retaining path：是谁还没松手",
    task: '在 Comparison 里挑一两个「Δ 最明显」或与 Detached/HTML 条目相关的结点，逐个展开 retaining path，顺着引用链口述：是哪个全局或模块级容器一直握着它们。',
    hints: [
      '本工作坊的演示会把「登记的监听 / interval / detached 节点」放在同一套登记表里——你在快照里看见的容器名会与页面下方「工作坊泄漏计数」有对应关系。',
      '真实仓库里则更常见：`window.__*`、模块顶层 `const cache = []`、singleton store、或遗漏的 unsubscribe API。',
    ],
  },
  {
    id: "code-hunt",
    title: "第 6 步 · 把证据钉回源代码",
    task: '结合以上观察：条幅「每次展示」时所挂载的组件里，最可能遗漏了哪三类 teardown？\n请在仓库里检索与条幅展示相关的文件名（可先搜「营销中心」「Ribbon」「promo」等你能想到的业务字样），在阅读 useEffect / 事件订阅代码前，先在纸上写下两句「你预期会在堆上看到的征兆」。',
    hints: [
      "重点搜：`addEventListener` 是否有对称的、`removeEventListener`；`setInterval`/`setTimeout` 的返回值是否保存在 ref/state 且在卸载分支 clear；是否把已从文档摘除的 DOM 塞进长期活着的调试数组或缓存。",
      "若 `useEffect` 的返回值是 `undefined` 或根本没 return cleanup，而它内部又注册了长寿命资源——这就是一个高优先级怀疑点。",
    ],
  },
];

/** 最后再展开，默认折叠 */
export const GUIDED_REVEAL_TITLE = "我确认找到了：标准答案";

export const GUIDED_REVEAL_BODY =
  "问题出在随条幅一起挂载的业务组件：`guided-scenario/PromotionRibbon.tsx`。其中的辅助函数「wirePromoSignalsForCampaign」在每次 effect 运行时向 `window` 注册 `resize`、启动一个新的 `setInterval`，并把已从 `document.body` 摘下的 `<aside>` 节点推进演示用的全局 detached 寄存表；而上层的 `useEffect` **没有返回清理函数**，因此在条幅卸载后三者都不会被拆掉。";
