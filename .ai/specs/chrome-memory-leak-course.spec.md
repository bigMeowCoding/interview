# Spec：Chrome 内存泄漏练习课程（Memory Leak Demo）

## 范围

- 在本地 Vite + React 应用中提供可交互演示，配合 Chrome DevTools **Memory → Heap snapshot** 练习定位常见前端内存泄漏。
- 讲义以 **5 节渐进课程** 形式呈现，实验区按当前课程高亮相关操作区。

## 功能要求

1. **课程导航**：可在第 1～5 课之间切换；支持上一课 / 下一课。
2. **每课讲义**：学习目标（学完你会）、Chrome 操作步骤、本课如何使用 Demo、建议操作顺序、自查清单（可勾选）。
3. **实验区**：泄漏制造（React 子组件、Detached DOM、监听、interval、大字符串）与一键修复；**第一课附带「抽屉开关」干净/泄漏对照案例**；全局计数与刷新；切换课程不自动清空已制造泄漏。
4. **可测试**：泄漏登记状态（`state.ts`）、第一课抽屉案例（`lesson1-drawer-case.ts`）具备单元测试；课程数据（`curriculum.ts`）具备结构校验测试。

## 实现映射

| 区域 | 路径 |
|------|------|
| 课程数据 | `src/react/memory-leak-demo/curriculum.ts` |
| 页面与交互 | `src/react/memory-leak-demo/MemoryLeakDemo.tsx` |
| 泄漏登记 / 修复 | `src/react/memory-leak-demo/state.ts` |
| 样式 | `src/react/memory-leak-demo/style.css` |
| 第一课抽屉对照案例 | `src/react/memory-leak-demo/lesson1-drawer-case.ts` |

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
2. 在实验区多次点击「制造 Detached DOM 并保留引用」（或 React 泄漏里的挂载循环）。  
3. 再拍 Snapshot 2，用 Comparison 对比 Snapshot 1。  
4. 在筛选器输入 Detached 或 HTMLDivElement，展开 retaining path 阅读引用链。  
5. 点击「清空 Detached DOM 引用数组」后拍 Snapshot 3，对比 Snapshot 2 是否回落。

**本课怎么用这个 Demo**

优先用手动区的「制造 Detached DOM」——现象单一，适合第一次看清 Detached。之后再试 React 泄漏子组件（同一课综合能力）。

**建议顺序**

1. 基准快照 → 点 3 次「制造 Detached DOM」→ 再快照 → Comparison  
2. 再点「清空 Detached DOM 引用数组」→ 第三张快照对比  

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
2. 多次点击「document 上多加一个 click 监听」与「新建 setInterval」。  
3. 拍 Snapshot 2，Comparison 看闭包、函数对象或 Native 相关条目变化（不同 Chrome 版本展示略有差异）。  
4. 打开 Performance Monitor（右上角 ⋮ → More tools），观察 JS heap / DOM 是否在重复操作下爬升。  
5. 依次「移除监听」「clear interval」，拍 Snapshot 3 对比。

**本课怎么用这个 Demo**

配合页面上的计数器：eventListeners、intervals 与你在本课点的次数应对得上。先单项点击（只加监听或只加 interval），再组合。

**建议顺序**

1. 只堆监听 5 次 → 快照对比  
2. 再只堆 interval 3 次 → 快照  
3. 最后用修复区两项清理 → 再快照  

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

**Chrome 操作（跟着做）**

1. 拍 Snapshot 1。  
2. 多次点击「泄漏 ~1MB 字符串」，每次约多 1MB 量级（视引擎而定）。  
3. Snapshot 2 Comparison 后按 Retained size 或 Delta 排序，找大块增长。  
4. 展开条目查看 retaining path，确认与本 demo 全局数组的关系。  
5. 「清空大字符串缓存」后 Snapshot 3，对比是否明显下降。

**本课怎么用这个 Demo**

本课训练「按大小找元凶」。若列表太长，用筛选框输入 string、Array 或与源码相关的变量意图缩小范围。

**建议顺序**

1. 连续泄漏字符串 3～5 次  
2. 在 Comparison 里按 Retained 排序找大块  
3. 清空字符串缓存后再拍一张验证  

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
2. 使用「连续挂载/卸载泄漏子组件」10～20 次（放大泄漏）。  
3. Snapshot 2 Comparison：结合前几课知识看监听、interval、detached。  
4. 仅挂载「干净子组件」重复进出路由级场景（多次挂载卸载），再拍一张对比（应先无明显累积）。  
5. 打开 Sources 或 Performance 辅助确认重复回调是否仍在触发（可选）。

**本课怎么用这个 Demo**

先只玩泄漏子组件，计数器会飙升；再切到干净子组件只做挂载卸载，观察计数与快照差异。修复泄漏需改源码里的 useEffect cleanup（本 demo 故意不写）。

**建议顺序**

1. 泄漏：连续挂载/卸载 20 次 → 快照  
2. 卸载泄漏组件后点「移除监听」「clear interval」「清空 Detached 引用」  
3. 干净子组件：多次挂载卸载 → 再快照对照  

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
