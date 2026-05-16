# Spec：Chrome 内存泄漏练习课程（Memory Leak Demo）

## 范围

- 在本地 Vite + React 应用中提供可交互演示，配合 Chrome DevTools **Memory → Heap snapshot** 练习定位常见前端内存泄漏。
- 讲义以 **5 节渐进课程** 形式呈现，实验区按当前课程高亮相关操作区。

## 功能要求

1. **课程导航**：可在第 1～5 课之间切换；支持上一课 / 下一课。
2. **每课讲义**：学习目标（学完你会）、Chrome 操作步骤、本课如何使用 Demo、建议操作顺序、自查清单（可勾选）。
3. **实验区**：泄漏制造（React 子组件、Detached DOM、监听、interval、大字符串）与一键修复；**第一课「抽屉开关」**、**第二课「Detached 专一」**、**第三课「监听 + 定时器」**、**第四课「大字符串」**与**第五课「React 挂载副作用」**附带干净/泄漏对照案例；支持 URL `?lesson=N` 直达第 N 课；全局计数与刷新；切换课程不自动清空已制造泄漏。
4. **可测试**：`state.ts`、第一课抽屉案例、第二课 Detached 案例（`lesson2-detached-case.ts`）、第三课监听/定时器案例（`lesson3-listeners-interval-case.ts`）、第四课大字符串案例（`lesson4-huge-string-case.ts`）、第五课 React 挂载案例（`lesson5-react-case.ts`）具备单元测试；课程数据（`curriculum.ts`）具备结构校验测试。

## 实现映射

| 区域 | 路径 |
|------|------|
| 课程数据 | `src/react/memory-leak-demo/curriculum.ts` |
| 页面与交互 | `src/react/memory-leak-demo/MemoryLeakDemo.tsx` |
| 泄漏登记 / 修复 | `src/react/memory-leak-demo/state.ts` |
| 样式 | `src/react/memory-leak-demo/style.css` |
| 第一课抽屉对照案例 | `src/react/memory-leak-demo/lesson1-drawer-case.ts` |
| 第二课 Detached 对照案例 | `src/react/memory-leak-demo/lesson2-detached-case.ts` |
| 第三课 监听 / 定时器对照案例 | `src/react/memory-leak-demo/lesson3-listeners-interval-case.ts` |
| 第四课 大字符串对照案例 | `src/react/memory-leak-demo/lesson4-huge-string-case.ts` |
| 第五课 React 挂载对照案例 | `src/react/memory-leak-demo/lesson5-react-case.ts` |

## 第一课配套案例（可运行）

**业务隐喻**：列表页「打开详情抽屉 → 关上」重复多次。

| 按钮 | 行为 |
|------|------|
| **重置案例环境** | 调用 `resetLeakDemoState()`，清空本 demo 登记的监听、Detached、interval、大字符串等 |
| **干净：开关抽屉 ×15** | 每轮：`addEventListener(mousemove)` 后立刻 `removeEventListener`，临时 `aside` 挂载后移除且**不**保留引用 |
| **泄漏：开关抽屉 ×15** | 每轮：通过 `registerLeakyListener` 永久挂一个 `mousemove`，并把移除后的 `aside` 放入全局 `detachedDomNodes` |

**第一课要看到的价值**：两次流程都用同一套 **Snapshot A → 操作 N 次 → Snapshot B → Comparison**，但第二次（泄漏版）在页面计数与 Heap Comparison 中会出现**与次数成比例的累积**（监听 + Detached）；干净版计数应保持 0，Comparison 的 Delta 也应明显更小（仍可能有引擎/React 噪声，但与泄漏版的量级差异通常一眼可分）。

**推荐快照顺序**（与页面实验区文案一致）：

1. 重置 → Snapshot **A**  
2. 干净 ×15 → Snapshot **B**，Comparison(A, B)  
3. 重置 → Snapshot **A′**  
4. 泄漏 ×15 → Snapshot **B′**，Comparison(A′, B′)

## 第二课配套案例（可运行）

**业务隐喻**：浮层 / Tooltip / Toast 等节点从文档移除后，仍被 JS 容器引用。

| 按钮 | 行为 |
|------|------|
| **重置案例环境** | 同第一课，调用 `resetLeakDemoState()` |
| **干净：仅挂载卸下 ×15** | 每轮：`div` 挂上 `body` 再 `removeChild`，**不** `pushDetachedNode` |
| **泄漏：Detached 引用 ×15** | 每轮：同上但从文档移除后执行 `pushDetachedNode`，模拟全局缓存握着节点 |

**第二课要看到的价值**：Comparison 里侧重 **Detached / HTMLDivElement** 与 retaining path 指向 demo 数组（及后续在真实项目里指向你的 Map/数组）；干净轮次不应增加本页的 `detachedDomRefs` 计数。

## 第三课配套案例（可运行）

**业务隐喻**：路由/弹层挂载时 `addEventListener` + `setInterval`，离开分支时忘了 teardown。

| 按钮 | 行为 |
|------|------|
| **重置案例环境** | 同前两课，`resetLeakDemoState()` |
| **干净：同步注册并清理 ×15** | 每轮：`document` 上同步 add/remove 一个 `click`；再 `setInterval` 后立即 `clearInterval`。不经过本 demo 的泄漏登记表 |
| **泄漏：监听+interval ×15** | 每轮：`registerLeakyListener(document, click)` + `startLeakyInterval(1500)`，计数区 `eventListeners` 与 `intervals` 各 +1 |

**第三课要看到的价值**：两轮 Comparison 中，泄漏版 **`eventListeners` 与 `intervals` 与次数同涨**（每轮两件事都做）；再用修复区移除监听、cleanup interval，新快照应变少。干净轮两计数应保持 0。

## 第四课配套案例（可运行）

**业务隐喻**：日志拼接、富文本缓存、导出 CSV 等把大段字符串放进模块级数组或 Map。

| 按钮 | 行为 |
|------|------|
| **重置案例环境** | 调用 `resetLeakDemoState()` |
| **干净：临时大字符串 ×15** | 每轮：`"x".repeat(1_000_000)` 仅作临时值，**不** `push` 到 `hugeStringRetention` |
| **泄漏：缓存 ~1MB 字符串 ×15** | 每轮：等同多次点击「泄漏 ~1MB 字符串」，全局计数 `millionCharStrings` +1 |

**第四课要看到的价值**：干净轮页面 **`~1MB strings` 仍为 0**，堆上不应像泄漏轮那样出现与次数成比例的常驻大字符串；Comparison 里按 Retained / Delta 排序时，泄漏轮更容易看到「大块」与 retaining path 指向本 demo 的全局数组。

## 第五课配套案例（可运行）

**业务隐喻**：路由/抽屉挂载时用 `useEffect` 注册了全局监听或定时器，卸载分支未返回 cleanup。

| 按钮 | 行为 |
|------|------|
| **重置案例环境** | `resetLeakDemoState()` |
| **干净：cleanup 对等 ×15** | 每轮：等价于干净子组件的「即时 teardown」——`scroll` 监听后立即 remove、`setInterval` 后立即 clear，不经本 Demo 登记表 |
| **泄漏：等价挂载副作用 ×15** | 每轮：与泄漏子组件单次 `useEffect` 同源（`window resize` + 登记 interval + Detached），页面三项计数各 +1 |

**第五课要看到的价值**：配套案例先做 **两轮 A/B**，读数应与轮次对齐；再配合「真实挂载/卸载」对比 **React 18 开发态 Strict Mode** 下 effect 可能被双调用导致的计数翻倍，印证 cleanup 必填。最后用修复区逐项回落。

## 五节课内容（讲义）

以下正文与源码 `src/react/memory-leak-demo/curriculum.ts` 中的 `LESSONS` **逐项对齐**；改课程内容时请同步更新该文件与本 Spec。

### 第 1 课 · Heap Snapshot 与 Comparison

- **副标题**：学会拍快照、选对视图、建立「前后对比」的习惯  
- **实验区高亮**：`stats`

**学完你会**

1. 知道 Heap snapshot 拍的是什么（某一时刻 JS 堆上的对象图）。  
2. 会用 Snapshot 2 的 Comparison 视图对比 Snapshot 1，看 Delta / Size。  
3. 理解「先基准、再操作、再拍一张」是定位泄漏的第一步。  
4. 能口述：Comparison 解决的是「在两个时间点之间，堆里净多了什么」，这是把泄漏从体感变成证据的第一步。

**Chrome 操作（跟着做）**

1. DevTools → Memory → Profiles → 选 Heap snapshot。  
2. 点击 Take snapshot，命名心里记作「基准」(Snapshot 1)。  
3. 不做操作或只做一次刷新计数，再 Take snapshot (Snapshot 2)。  
4. 选中 Snapshot 2，左上角下拉改为 Comparison，Baseline 选 Snapshot 1。  
5. 在筛选框试着输入 Array、Object，观察 # New / # Deleted / Size Delta。

**实际场景举例**

例如后台列表页「打开详情抽屉 → 完全关闭」本应释放组件与监听；若忘了 unsubscribe 或把 DOM 节点塞进全局缓存，每做一次界面看不出问题，堆却会线性涨。**做法**：在界面回到稳定状态后拍 Snapshot A，重复同一操作 N 次（勿整页刷新），再拍 Snapshot B，用 B 对 A 做 Comparison——若某类对象（如 HTMLDivElement、闭包、特定 Array）的 # New 随次数单调累积而回收不对称，就说明泄漏发生在该交互闭环内；再结合 retaining path（后续课）追到是哪段代码握着引用。

**本课怎么用这个 Demo**

本课先熟悉工具链：学会固定 Baseline、读 # New / # Deleted / Size Delta。可先只做「刷新计数」这种微小变化；熟练后再到第 5 课用「反复挂载泄漏子组件」放大对比信号。

**建议顺序**

1. 按实验区「第一课配套案例」先后跑**干净版**与**泄漏版**，各完成一轮 Snapshot A/B Comparison（见上方 Spec 节「第一课配套案例」）。  
2. 再试「刷新计数显示」2～3 次，体会更小粒度下的 Comparison Delta。

- [ ] 我能独立打开 Memory → Heap snapshot 并拍下快照。  
- [ ] 我会把第二张设为 Comparison，并选对 Baseline。  
- [ ] 我知道 Snapshot 反映的是「拍摄瞬间」，不是实时曲线。

---

### 第 2 课 · Detached DOM

- **副标题**：识别「已从文档树移除但仍被 JS 引用」的 DOM  
- **实验区高亮**：`manual`、`fix`

**学完你会**

1. 能在快照 Summary / 筛选器里注意到与 Detached、HTMLDivElement 相关的条目。  
2. 理解：removeChild 后若仍有变量/数组持有节点，节点无法被 GC。  
3. 会把「保留 detached 引用的容器」（如全局数组）当作可疑 retaining path。

**Chrome 操作（跟着做）**

1. 拍一张基准快照 (Snapshot 1)。  
2. 优先使用实验区「第二课配套案例」：**干净 ×15** / **泄漏 ×15** 各跑一轮 Comparison；或多次点击「制造 Detached DOM 并保留引用」（及第 5 课 React 泄漏子挂载循环）。  
3. 再拍 Snapshot 2，用 Comparison 对比 Snapshot 1。  
4. 在筛选器输入 Detached 或 HTMLDivElement，展开 retaining path 阅读引用链。  
5. 点击「清空 Detached DOM 引用数组」后拍 Snapshot 3，对比 Snapshot 2 是否回落。

**实际场景举例**

例如 Tooltip/Popover 关闭后节点已从文档移除，但工具函数仍把容器节点放在模块级 Set 里做「缓存」；或列表单元格里 append 的临时节点被错误地放进全局 debug 数组。表现：节点不在 Elements 树里，却在 Heap 里显示 Detached，retaining path 指向你的缓存或 React fiber 外的某个容器。

**本课怎么用这个 Demo**

优先跑「第二课配套案例」：干净 vs 泄漏两轮 Comparison，只看 Detached/HTMLDivElement；再点单次「制造 Detached DOM」加深印象。进阶：第 5 课泄漏子组件每轮也会 push Detached，可与本课对照。

**建议顺序**

1. 第二课配套案例：干净 ×15 vs 泄漏 ×15，各做 Comparison，并在快照里搜 Detached。  
2. 再单点 3 次「制造 Detached DOM」→ 清空引用数组 → 第三张快照验证回落。  

**自查**

- [ ] 我能解释 Detached DOM 与「页面里看不见」不是一回事。  
- [ ] 我会在快照树里顺着 retaining path 找到是谁握着节点。  
- [ ] 我知道清空全局数组引用可以让节点变为可回收（在无其它引用时）。

---

### 第 3 课 · 事件监听与定时器

- **副标题**：DOM/window 监听与 setInterval 未清理的典型泄漏  
- **实验区高亮**：`manual`、`fix`

**学完你会**

1. 知道每个未 remove 的监听会让目标对象持有回调闭包相关引用。  
2. 知道未 clear 的 interval 会一直占用定时器与闭包环境。  
3. 会用修复按钮验证：清理后新快照中相关 retained 是否减少。

**Chrome 操作（跟着做）**

1. 拍 Snapshot 1。  
2. 优先试用实验区「第三课配套案例」：**干净 ×15** / **泄漏 ×15** 各跑一轮 Comparison；或逐项多次点击「document 上多加一个 click 监听」与「新建 setInterval」。  
3. 拍 Snapshot 2，Comparison 看闭包、函数对象或 Native 相关条目变化（不同 Chrome 版本展示略有差异）。  
4. 打开 Performance Monitor（右上角 ⋮ → More tools），观察 JS heap / DOM 是否在重复操作下爬升。  
5. 依次「移除监听」「clear interval」，拍 Snapshot 3 对比。

**本课怎么用这个 Demo**

优先跑「第三课配套案例」两轮 Comparison，`eventListeners` 与 `intervals` 与次数应对齐；再单项只做监听或只做 interval；最后用修复区两项验证回落。

**建议顺序**

1. 第三课配套案例：干净 ×15 vs 泄漏 ×15，各 Comparison 一次  
2. 只堆监听 5 次 → 快照对比  
3. 再只堆 interval 3 次 → 快照  
4. 最后用修复区两项清理 → 再快照  

**自查**

- [ ] 我会在组件卸载或路由离开时联想到 removeEventListener / clearInterval。  
- [ ] 我知道第三方库也可能注册全局监听，需要查 dispose API。  
- [ ] 我能用「清理前后各一张快照」验证修复是否生效。

---

### 第 4 课 · Retained Size 与大对象

- **副标题**：用 Shallow / Retained 理解「谁占内存」  
- **实验区高亮**：`manual`、`fix`

**学完你会**

1. 区分 Shallow size（自身）与 Retained size（连同仅由此可达的对象）。  
2. 知道字符串、大数组在快照里常表现为独立条目或 Array / system / String。  
3. 学会用「泄漏 → 对比 → 排序 Retained → 读 retaining path」缩小范围。

**知识点：Shallow size 与 Retained size**

- **Shallow size（浅层 / 自身）**：通常指**这个堆节点自己**占用的字节，**不包含**它通过属性、内部槽位引出去的那些子对象。因此一个小 wrapper 若只拿着某个大数组的引用，它的 Shallow 往往仍然很小；而真正「块头大」的可能是那条引用链末端的 `Array`、`String` 等条目。
- **Retained size（保留）**：若从根集合出发整条引用图不变、仅考虑「释放这个节点所指的那一份子图」时，GC **能多回收多少内存**（工程上常把它理解成：该对象自身 + **只靠从它出发才能到达**、且无其它路径保活的对象；若同一对象还被全局、闭包等别路引用，就不会把整坨都算进**单条** retaining path 的「独占责任」里——Chrome 展示可能会有聚合/去重规则，细节以官方文档为准）。
- **对照记忆**：Shallow 回答「**这个格子本身**胖不胖」；Retained 回答「**从格子当入口**能拽出多大一片」。
- **小例子**：`wrapper`（Shallow 很小）**唯一**引用一个约 10MB 的数组 → `wrapper` 或与之相邻的条目上，**Retained** 往往接近 10MB 量级；若该数组还被 `window` 上的变量引用，则大块的主要「谁在保留」会更多体现在那条全局链上。
- **为何要会看 Retained**：泄漏排查时按 **Retained** 或 **Delta** 排序，更容易发现**入口小、却牵着一大坨**的节点；再展开 **retaining path** 追到缓存数组、Map、未清理的闭包等代码位置。

**Chrome 操作（跟着做）**

1. 拍 Snapshot 1。  
2. 优先使用实验区「第四课配套案例」：**干净 ×15** / **泄漏 ×15** 各跑一轮 Comparison；或多次点击「泄漏 ~1MB 字符串」，每次约多 1MB 量级（视引擎而定）。  
3. Snapshot 2 Comparison 后按 Retained size 或 Delta 排序，找大块增长。  
4. 展开条目查看 retaining path，确认与本 demo 全局数组的关系。  
5. 「清空大字符串缓存」后 Snapshot 3，对比是否明显下降。

**本课怎么用这个 Demo**

本课训练「按大小找元凶」。**Shallow** 侧重对象自身占用；**Retained** 近似「以该节点为入口、会一并被回收的那片子图」——小对象也可能 Retained 很大（拽着大数组/大字符串）。排查时多按 Retained 或 Comparison 里的 Delta 排序，再结合 retaining path。若列表太长，用筛选框输入 string、Array 缩小范围。

**建议顺序**

1. 第四课配套案例：干净 ×15 vs 泄漏 ×15，各 Comparison 一次（页面 `~1MB strings` 应与泄漏次数对齐）  
2. 再连续手动泄漏字符串 3～5 次  
3. 在 Comparison 里按 Retained 排序找大块 → 清空字符串缓存后再拍一张验证  

**自查**

- [ ] 我能说出 Retained size 为什么往往比 Shallow 更值得先看。  
- [ ] 我会对大 Delta 的对象先看 retaining path 再改代码。  
- [ ] 我知道缓存、全局 Map、无限 push 的数组都是常见大户。

---

### 第 5 课 · React 中的泄漏模式

- **副标题**：useEffect 无清理 vs 正确 cleanup；挂载循环放大问题  
- **实验区高亮**：`react`、`fix`

**学完你会**

1. 能写出带返回函数的 useEffect：卸载时 removeListener、clearInterval、disconnect、abort。  
2. 知道 Strict Mode 双调用 effect 在开发态可能放大「未清理」问题（仍应在 cleanup 里做对）。  
3. 会用「泄漏子组件 vs 干净子组件」对照同一操作下的快照差异。

**Chrome 操作（跟着做）**

1. 拍 Snapshot 1。  
2. 实验区「第五课配套案例」：先后跑干净 ×15 / 等价泄漏挂载 ×15，各做一轮 Comparison（读数对齐轮次）；再使用「连续挂载/卸载泄漏子组件」10～20 次（放大信号，同源副作用）。  
3. Snapshot 2 Comparison：结合前几课知识看监听、interval、detached。  
4. 仅挂载「干净子组件」重复进出路由级场景（多次挂载卸载），再拍一张对比（应先无明显累积；开发态 Strict Mode 下注意观察 effect 双调用）。  
5. 打开 Sources 或 Performance 辅助确认重复回调是否仍在触发（可选）。

**本课怎么用这个 Demo**

先跑配套案例的一对按钮对照计数与快照（批量路径每轮只累加一回）；再切换下方泄漏/干净子组件做真实挂载卸载，对比 Strict Mode 下计数是否被放大一倍。卸载后可用修复区验证回落；修复源代码里的 useEffect cleanup 才是根治（本 demo 故意不写 cleanup）。

**建议顺序**

1. 第五课配套案例：干净 cleanup 对等 ×15 vs 泄漏等价挂载 ×15，各 Comparison 一次  
2. 泄漏子组件连续挂载/卸载 20 次 → 快照  
3. 卸载泄漏组件后点「移除监听」「clear interval」「清空 Detached 引用」  
4. 干净子组件：多次挂载卸载 → 再快照对照  

**自查**

- [ ] 我会在每个订阅类 effect 里问自己：卸载时要 cancel / unsubscribe / clear 吗？  
- [ ] 我会避免在全局模块级数组里长期 push DOM/React 引用。  
- [ ] 我能口述 React 18 Strict Mode 开发态下 effect 跑两次时 cleanup 的重要性。

---

## 非目标

- 不在此 Spec 中强制接入真实后端或监控平台。
- 不承诺与任意 Chrome 版本的 Heap 视图字段完全一致（UI 以 Chrome 官方为准）。

## 验收

- `npm start` 可打开页面并完成任意一课所列 Chrome 步骤。
- `npx vitest run src/react/memory-leak-demo/` 全部通过。
- `npx vite build` 成功。
