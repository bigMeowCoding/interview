export type LabRegion = "stats" | "react" | "manual" | "fix";

export interface Lesson {
  index: number;
  title: string;
  subtitle: string;
  outcomes: string[];
  chromeSteps: string[];
  labGuide: string;
  /** 可选：联系真实业务的简短场景说明（目前第 1 课使用） */
  realWorldExample?: string;
  tryThis: string[];
  checklist: string[];
  focus: LabRegion[];
}

/** 按顺序学完即可独立用 Chrome Memory 排查常见前端泄漏 */
export const LESSONS: Lesson[] = [
  {
    index: 1,
    title: "第 1 课 · Heap Snapshot 与 Comparison",
    subtitle: "学会拍快照、选对视图、建立「前后对比」的习惯",
    outcomes: [
      "知道 Heap snapshot 拍的是什么（某一时刻 JS 堆上的对象图）。",
      "会用 Snapshot 2 的 Comparison 视图对比 Snapshot 1，看 Delta / Size。",
      "理解「先基准、再操作、再拍一张」是定位泄漏的第一步。",
      "能口述：Comparison 解决的是「在两个时间点之间，堆里净多了什么」，这是把泄漏从体感变成证据的第一步。",
    ],
    chromeSteps: [
      "DevTools → Memory → Profiles → 选 Heap snapshot。",
      "点击 Take snapshot，命名心里记作「基准」(Snapshot 1)。",
      "不做操作或只做一次刷新计数，再 Take snapshot (Snapshot 2)。",
      "选中 Snapshot 2，左上角下拉改为 Comparison，Baseline 选 Snapshot 1。",
      "在筛选框试着输入 Array、Object，观察 # New / # Deleted / Size Delta。",
    ],
    labGuide:
      "本课先熟悉工具链：学会固定 Baseline、读 # New / # Deleted / Size Delta。可先只做「刷新计数」这种微小变化；熟练后再到第 5 课用「反复挂载泄漏子组件」放大对比信号。",
    realWorldExample:
      "例如后台列表页「打开详情抽屉 → 完全关闭」本应释放组件与监听；若忘了 unsubscribe 或把 DOM 节点塞进全局缓存，每做一次界面看不出问题，堆却会线性涨。做法：在界面回到稳定状态后拍 Snapshot A，重复同一操作 N 次（勿整页刷新），再拍 Snapshot B，用 B 对 A 做 Comparison——若某类对象（如 HTMLDivElement、闭包、特定 Array）的 # New 随次数单调累积而回收不对称，就说明泄漏发生在该交互闭环内；再结合 retaining path（后续课）追到是哪段代码握着引用。",
    tryThis: [
      "按实验区「第一课配套案例」跑干净版 vs 泄漏版，各做一轮 Snapshot A/B Comparison",
      "再试「刷新计数显示」2～3 次，观察 Comparison 里更微小的 Delta",
    ],
    checklist: [
      "我能独立打开 Memory → Heap snapshot 并拍下快照。",
      "我会把第二张设为 Comparison，并选对 Baseline。",
      "我知道 Snapshot 反映的是「拍摄瞬间」，不是实时曲线。",
    ],
    focus: ["stats"],
  },
  {
    index: 2,
    title: "第 2 课 · Detached DOM",
    subtitle: "识别「已从文档树移除但仍被 JS 引用」的 DOM",
    outcomes: [
      "能在快照 Summary / 筛选器里注意到与 Detached、HTMLDivElement 相关的条目。",
      "理解：removeChild 后若仍有变量/数组持有节点，节点无法被 GC。",
      "会把「保留 detached 引用的容器」（如全局数组）当作可疑 retaining path。",
    ],
    chromeSteps: [
      "拍一张基准快照 (Snapshot 1)。",
      "在实验区多次点击「制造 Detached DOM 并保留引用」（或 React 泄漏里的挂载循环）。",
      "再拍 Snapshot 2，用 Comparison 对比 Snapshot 1。",
      "在筛选器输入 Detached 或 HTMLDivElement，展开 retaining path 阅读引用链。",
      "点击「清空 Detached DOM 引用数组」后拍 Snapshot 3，对比 Snapshot 2 是否回落。",
    ],
    labGuide:
      "优先跑下方「第二课配套案例」：干净 vs 泄漏两轮 Comparison，只看 Detached/HTMLDivElement；再点单次「制造 Detached DOM」加深印象。进阶：第 5 课泄漏子组件每轮也会 push Detached，可与本课对照。",
    realWorldExample:
      "例如 Tooltip/Popover 关闭后节点已从文档移除，但工具函数仍把容器节点放在模块级 Set 里做「缓存」；或列表单元格里 append 的临时节点被错误地放进全局 debug 数组。表现：节点不在 Elements 树里，却在 Heap 里显示 Detached，retaining path 指向你的缓存或 React fiber 外的某个数组。",
    tryThis: [
      "第二课配套案例：干净 ×15 vs 泄漏 ×15，各做 Comparison，并在快照里搜 Detached",
      "再单点 3 次「制造 Detached DOM」→ 清空引用数组 → 第三张快照验证回落",
    ],
    checklist: [
      "我能解释 Detached DOM 与「页面里看不见」不是一回事。",
      "我会在快照树里顺着 retaining path 找到是谁握着节点。",
      "我知道清空全局数组引用可以让节点变为可回收（在无其它引用时）。",
    ],
    focus: ["manual", "fix"],
  },
  {
    index: 3,
    title: "第 3 课 · 事件监听与定时器",
    subtitle: "DOM/window 监听与 setInterval 未清理的典型泄漏",
    outcomes: [
      "知道每个未 remove 的监听会让目标对象持有回调闭包相关引用。",
      "知道未 clear 的 interval 会一直占用定时器与闭包环境。",
      "会用修复按钮验证：清理后新快照中相关 retained 是否减少。",
    ],
    chromeSteps: [
      "拍 Snapshot 1。",
      "优先试用实验区「第三课配套案例」：**干净 ×15** / **泄漏 ×15** 各跑一轮 Comparison；或逐项多次点击「document 上多加一个 click 监听」与「新建 setInterval」。",
      "拍 Snapshot 2，Comparison 看闭包、函数对象或 Native 相关条目变化（不同 Chrome 版本展示略有差异）。",
      "打开 Performance Monitor（右上角 ⋮ → More tools），观察 JS heap / DOM 是否在重复操作下爬升。",
      "依次「移除监听」「clear interval」，拍 Snapshot 3 对比。",
    ],
    labGuide:
      "优先跑下方「第三课配套案例」：两轮 Comparison，观察页面计数器的 eventListeners、intervals 是否与操作次数对齐；再配合单项点击只做监听或只做 interval；最后用修复区验证回落。",
    tryThis: [
      "第三课配套案例：干净 ×15 vs 泄漏 ×15，各 Comparison 一次（泄漏轮每迭代各 +1 监听与 +1 interval）",
      "只堆监听 5 次 → 快照对比",
      "再只堆 interval 3 次 → 快照",
      "最后用修复区两项清理 → 再快照",
    ],
    checklist: [
      "我会在组件卸载或路由离开时联想到 removeEventListener / clearInterval。",
      "我知道第三方库也可能注册全局监听，需要查 dispose API。",
      "我能用「清理前后各一张快照」验证修复是否生效。",
    ],
    focus: ["manual", "fix"],
  },
  {
    index: 4,
    title: "第 4 课 · Retained Size 与大对象",
    subtitle: "用 Shallow / Retained 理解「谁占内存」",
    outcomes: [
      "区分 Shallow size（自身）与 Retained size（连同仅由此可达的对象）。",
      "知道字符串、大数组在快照里常表现为独立条目或 Array / system / String。",
      "学会用「泄漏 → 对比 → 排序 Retained → 读 retaining path」缩小范围。",
    ],
    chromeSteps: [
      "拍 Snapshot 1。",
      "优先使用「第四课配套案例」跑**干净 ×15** / **泄漏 ×15** 各一轮 Comparison；或多次点击「泄漏 ~1MB 字符串」。",
      "Snapshot 2 Comparison 后按 Retained size 或 Delta 排序，找大块增长。",
      "展开条目查看 retaining path，确认与本 demo 全局数组的关系。",
      "「清空大字符串缓存」后 Snapshot 3，对比是否明显下降。",
    ],
    labGuide:
      "本课训练「按大小找元凶」。**Shallow size** 侧重对象**自身**占用；**Retained size** 近似「以该节点为入口、会一并被回收的那片子图」——小对象也可能 Retained 很大（拽着大数组/大字符串）。排查时多按 Retained 或 Comparison 里的 Delta 排序，再结合 retaining path。若列表太长，用筛选框输入 string、Array 缩小范围。",
    tryThis: [
      "第四课配套案例：干净 ×15 vs 泄漏 ×15，各 Comparison 一次（~1MB strings 计数应与泄漏次数对齐）",
      "再连续手动泄漏字符串 3～5 次，体会单次点击与批量的差别",
      "在 Comparison 里按 Retained 排序找大块 → 清空字符串缓存后再拍验证回落",
    ],
    checklist: [
      "我能说出 Retained size 为什么往往比 Shallow 更值得先看。",
      "我会对大 Delta 的对象先看 retaining path 再改代码。",
      "我知道缓存、全局 Map、无限 push 的数组都是常见大户。",
    ],
    focus: ["manual", "fix"],
  },
  {
    index: 5,
    title: "第 5 课 · React 中的泄漏模式",
    subtitle: "useEffect 无清理 vs 正确 cleanup；挂载循环放大问题",
    outcomes: [
      "能写出带返回函数的 useEffect：卸载时 removeListener、clearInterval、disconnect、abort。",
      "知道 Strict Mode 双调用 effect 在开发态可能放大「未清理」问题（仍应在 cleanup 里做对）。",
      "会用「泄漏子组件 vs 干净子组件」对照同一操作下的快照差异。",
    ],
    chromeSteps: [
      "拍 Snapshot 1（基准）。",
      "实验区「第五课配套案例」：先后跑干净 ×15 与等价泄漏挂载 ×15，各做一轮 Comparison；或直接「连续挂载/卸载泄漏子组件」10～20 次放大信号（与单次 effect 同源）。",
      "Snapshot 2 Comparison：结合前几课知识看监听、interval、detached。",
      "仅挂载「干净子组件」重复进出路由级场景（多次挂载卸载），再拍一张对比（应先无明显累积；开发态 Strict Mode 下注意观察 effect 的双调用）。",
      "打开 Sources 或 Performance 辅助确认重复回调是否仍在触发（可选）。",
    ],
    labGuide:
      "先跑配套案例的一对按钮：计数应与轮次对齐、干净轮仍为 0。再打开下方泄漏子组件与「连续挂载/卸载」，对比快照；开发态 Strict Mode 可能把未写 cleanup 的问题放大一倍，更凸显清理函数的必要性。若要修复泄漏需改源码里的 useEffect cleanup（本 demo 故意不写）。",
    tryThis: [
      "第五课配套案例：干净 cleanup 对等 ×15 vs 泄漏等价挂载 ×15，各 Comparison 一次",
      "泄漏子组件：连续挂载/卸载 20 次 → 快照",
      "卸载泄漏组件后点「移除监听」「clear interval」「清空 Detached 引用」验证回落",
      "干净子组件：多次挂载卸载 → 再快照对照",
    ],
    checklist: [
      "我会在每个订阅类 effect 里问自己：卸载时要 cancel / unsubscribe / clear 吗？",
      "我会避免在全局模块级数组里长期 push DOM/React 引用。",
      "我能口述 React 18 Strict Mode 开发态下 effect 跑两次时 cleanup 的重要性。",
    ],
    focus: ["react", "fix"],
  },
  {
    index: 6,
    title: "第 6 课 · 综合演练：从可疑源码到快照证据",
    subtitle:
      "先读代码找「脚注式」泄漏点，再用 Comparison + retaining path 验证",
    outcomes: [
      "能对着一页业务代码划出：未 teardown 的全局监听、未保存 id 的 setInterval、以及仍被缓存持有的 Detached DOM。",
      "会按固定节奏操作：重置 → Snapshot A → 重复同一交互 N 次 → Snapshot B → Comparison。",
      "会在快照里点开 retaining path：从「谁在持有」倒退到源码中的容器名 / 模块 / effect。",
      "理解本 Demo 故意用全局登记（state.ts）桥接示意代码与实际堆条目，便于你在真项目里替换成自己的模块级 Map/数组。",
    ],
    chromeSteps: [
      "实验区阅读「疑点源码」里 setupLiveNotifyPanel 示意版，预想哪三处会与堆增长相关。",
      "重置案例环境 → 拍 Snapshot A（稳定态基准）。",
      "点「泄漏：示意面板打开 ×15」→ 拍 Snapshot B → 用 Comparison(B,A)：筛选 HTMLDivElement / Detached / 与闭包相关的条目，观察三类信号是否都与 15 同量级。",
      "再重置 → Snapshot A′ →「干净：对等 teardown ×15」→ B′ → Comparison：页面三项计数应保持 0，堆上增长应不明显。",
      "在泄漏 Comparison 中选一条 # New 或 Delta 醒目的节点，展开 retaining path：辨认是否指向监听注册表、interval 数组或 Detached 容器（与本仓库 state.ts 中的登记语义对应）。",
      "用实验区「移除监听」「clear interval」「清空 Detached」分项尝试 → 再拍快照，确认证据链与读源码时的猜想一致。",
    ],
    labGuide:
      "本课把前几课摞成<strong>一条龙排查剧本</strong>：先静态读代码列出假设，再用堆对比验证，最后用修复按钮做「归因确认」。真实项目里没有本页的计数器，因此更要依赖：同一操作闭环、足够多的重复次数，以及 retaining path 上的模块/global 变量名。若路径指向压缩后的 bundle，可借助 source map 映射回可读源码。",
    realWorldExample:
      "常见于「详情浮层」「通知条」「右下角直播提示」等小部件：挂载时顺手 document.addEventListener；轮询草稿忘存 timer id；或为排查 bug 把 panel 塞进 window 上的调试数组。单点一次 QA 看不出来，正式上线后用户在页面里反复进出该流程，堆里就线性淤积。先做静态 code review 找 teardown 对称性，再像本课这样在稳定态前后拍快照，用 Comparison 收口。",
    tryThis: [
      "只靠读源码：盖住实验区计数区，仍能口头说出泄漏版 ×15 后堆里大概会多哪几类引用。",
      "泄漏 ×15 vs 干净 ×15 各一轮 Comparison；在 retaining path 里分别找到「监听」「定时器」「DOM 锚点」相关线索。",
      "只点「移除监听」再快照，再看仅 clear interval、仅清空 Detached 的差异，体会分项归因。",
    ],
    checklist: [
      "我会把「卸载 / 路由离开 / 弹层关闭」当作必须写 teardown 的时机。",
      "我会先在源码里 grep addEventListener、setInterval、push( 等模式，再上堆佐证。",
      "我知道 retaining path 是连接「堆里对象」与「业务变量名」的最后一公里。",
    ],
    focus: ["manual", "fix", "stats"],
  },
];
