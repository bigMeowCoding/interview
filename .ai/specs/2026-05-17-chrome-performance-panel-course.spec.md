# Spec：Chrome Performance 面板实战课程（前端性能定位与修复）

## 范围

- 在本地 Vite + React 项目中提供一套可重复演练的性能诊断课程，核心工具为 Chrome DevTools **Performance** 面板。
- 课程目标是让学习者掌握完整闭环：**录制性能 → 读懂证据 → 归因到代码 → 实施修复 → 二次录制验证收益**。
- 覆盖页面卡顿、长任务、重复渲染、布局抖动（Layout/Style）、主线程阻塞等常见前端性能问题。

## 功能要求

1. **课程导航**：至少 6 节渐进课程，支持上一课 / 下一课与课程直达。
2. **每课讲义结构统一**：每课必须包含学习目标、Chrome 操作步骤、Demo 操作步骤、判定标准、自查清单。
3. **性能实验区**：提供可控“问题注入”与“一键修复”能力，支持重复操作放大信号，便于在 Timeline 中观察差异。
4. **证据导向**：每课都必须要求学习者产出一份“修复前后对比证据”（至少含一次录制前后指标对比）。
5. **可测试**：课程元数据、关键交互状态、问题注入函数与修复函数具备单元测试（保证演示行为稳定可复现）。

## 六节课课程设计

以下内容为验收最小集合，可在实现期补充细节，但不得减少核心能力点。

### 第 1 课 · 录制基础：先拿到可比数据

- 学会开启录制、停止录制、缩放时间轴与定位交互区间。
- 学会在同一操作路径下录制两次（基准与实验），建立“可比较样本”。
- 本课完成标准：能指出一次交互在 Performance 里的起止区间，并截图保存基准录制结果。

### 第 2 课 · Flame Chart 入门：定位主线程长任务

- 学会在 Main 线程中识别 `Long task` 与可疑函数栈。
- 学会区分脚本执行、渲染、布局、绘制阶段的大致耗时分布。
- 本课完成标准：能明确说出“哪一段函数调用链最耗时”，并定位到对应源码模块。

### 第 3 课 · 交互卡顿排查：从事件到渲染提交

- 学会围绕点击/输入/滚动事件追踪处理链路，识别慢响应来源。
- 学会判断问题属于“JS 计算过重”“重复渲染过多”或“渲染流水线过重”。
- 本课完成标准：对同一交互给出至少 1 个可执行优化点（如节流、拆分计算、减少无效更新）。

#### 第 3 课 · 讲稿要点与实现对照（已与 `state.ts` / 历史页面对齐）

- **要证明什么**：高频事件（如 `input`）若在**每次触发**都跑昂贵同步计算，主线程会在短时间内产生**多次**长脚本/重任务；**防抖**把「算多少次」收成「停手后再算」，优化的是**重复无效计算次数**，单次最终结果该算仍可算，总 wall time 不一定更短，但交互更跟手、长任务更稀疏。
- **Demo 行为（已实现）**：`runInputSyncSearch` / `runInputDeferredSearch` 共用 `simulateSearchWorkload`（含循环 + 固定 `blockMainThreadForMs`，便于肉眼与 Performance 可见）；`runLesson3SyncBurst` 同步连跑多次；`scheduleLesson3DeferredBurstFinal` 模拟多次重置定时器、**仅最后一次**触发 `runInputDeferredSearch`；常量 `LESSON3_INPUT_DEBOUNCE_MS` 与输入框防抖间隔一致。
- **User Timing**：`lesson3-input-sync-duration`、`lesson3-input-deferred-duration`；对比时应看 **measure 条数**（同步 ≈ 键入次数或 burst 次数；防抖 burst 场景通常 1 条）。
- **Chrome 操作**：Performance 录制两段（同步路径 vs 防抖路径）；Bottom-up / Group by URL 过滤扩展脚本噪声；无痕窗口可减少 `content_main.js` 干扰。
- **验收话术**：能口述「防抖的性能价值 = 减少高频回调内的无效重算次数」，并与第三课 Performance 证据一致。

### 第 4 课 · Rendering 视角：Layout / Recalculate Style / Paint

- 学会观察样式重算与布局阶段异常膨胀，识别布局抖动（layout thrashing）迹象。
- 学会结合代码识别触发强制同步布局的读写交错模式。
- 本课完成标准：能完成一次“批量读写分离”或“减少不必要布局触发”的优化，并在录制中看到下降。

#### 第 4 课 · 讲稿要点与实现对照（已实现于 `state.ts`，入口页曾独占第四课）

- **核心概念**  
  - **写样式**（尤其影响布局的 CSS）会使排版结果「待更新」；**读几何**（`offsetWidth`、`offsetHeight`、`getBoundingClientRect` 等）若发生在脏布局之后，浏览器常需**立即完成布局**才能返回答案，即 **强制同步布局（forced reflow）**。  
  - **Layout thrashing（布局抖动）**：在循环内对多个 DOM 节点 **读 → 写 → 再读** 交错执行，导致布局被反复强制计算，Main 线程上 **Layout（紫色）** 片段碎、多、耗时。

- **坏路径（问题注入）**：`runLesson4ForcedReflowBad` — 对每个节点、每一外层轮次：`offsetWidth` → 改 `style.width` → 再读 `offsetHeight`，双重循环放大抖动信号。  
- **好路径（对照 / 优化）**：`runLesson4ForcedReflowGood` — 每轮先 `nodes.map` 一次性读出 `w/h`（读阶段），再循环**只写** `style.width`，用快照中的 `h` 做校验和；**先读后写、读写分离**，减少强制布局次数。  
- **可调参数**：`LESSON4_BOX_COUNT`、`LESSON4_REFLOW_OUTER_LOOPS`（盒⼦数 × 外层轮数），变大则 trace 中 Layout 更明显，按需与机器性能平衡。

- **User Timing**：`lesson4-forced-reflow-bad-duration`、`lesson4-forced-reflow-good-duration`。

- **Chrome 操作**：同一台机器连续录两次 — 先点「交错读写」，再点「先读后写」；对比 Main 上 **Layout** 密度与总耗时；辅以 User Timing 两项 duration。统计字段：`lesson4ReflowBadRuns`、`lesson4ReflowGoodRuns`（见 `lessonOneStats`）。

- **验收话术**：能解释「为何读写交错会抖」；能说明「批量读、再批量写」为何能缓解；能用两次录制佐证好版优于坏版（趋势即可，不强制绝对数值）。

### 第 5 课 · React 场景：重复渲染与提交成本

- 学会结合 Performance 与 React 组件更新行为，识别高频无效渲染。
- 学会验证常见优化手段（`memo`、稳定引用、状态下沉/拆分）是否真正带来收益。
- 本课完成标准：至少完成一个组件级优化，并用前后录制证明主线程耗时或渲染次数下降。

#### 第 5 课 · 讲稿要点与实现对照（当前 `PerformancePanelDemo` 为第五课）

- **要证明什么**：父组件**高频** `setState`（如 `setInterval` 更新 `tick`）时，若子组件**每次随父 render** 都执行同步重活，Main 线程会出现大量与 render 次数成正比的短任务；通过 **`React.memo` + 不把高频 state 作为子组件 props**（子只接收稳定字面量或稳定引用），可让子组件在父更新时**跳过 render**，重活次数急剧下降。
- **糟糕场景**：`Lesson5BadBlock` → `UnstableHeavyChild` 接收 `tick`，每次变化必 render；render 内调用 `runLesson5ChildRenderWork("bad")`（内含 `blockMainThreadForMs` + User Timing）。
- **对照场景**：`Lesson5GoodBlock` → `StableHeavyChild` 为 `memo(...)`，仅接收不变的 `label` 字符串；父组件 `tick` 仍在变但不传入子组件，子组件 props 浅比较不变 → 基本不重渲染。
- **User Timing**：`lesson5-bad-child-render`、`lesson5-good-child-render`（条数对比为核心证据）。
- **可调参数**：`Lesson5Scenarios.tsx` 中 `LESSON5_PARENT_TICK_MS`（父更新间隔）；`state.ts` 中导出的 `LESSON5_CHILD_BLOCK_MS`（子 render 内阻塞，由 `runLesson5ChildRenderWork` 使用）。
- **统计字段**：`lesson5BadChildWorkRuns`、`lesson5GoodChildWorkRuns`（等于对应路径下重活执行次数，与糟糕路径下子 render 次数一致；对照路径在开发态 Strict Mode 下可能略大于「肉眼以为的 1 次」）。
- **Chrome 操作**：先后录制「挂载糟糕场景」与「挂载对照场景」各一段固定时长；对比 User Timing 条数与 Main 上 Scripting 密度。

### 第 6 课 · 综合演练：问题闭环与回归标准

- 给出一段“真实业务风格”慢页面，学习者独立完成：录制、归因、修复、复测。
- 输出结构化结论：问题现象、证据截图、根因描述、修复方案、收益数据、剩余风险。
- 本课完成标准：结论可被他人复现，且包含明确的“继续优化建议”。

## 实现映射（与当前仓库一致，随迭代更新）

| 区域 | 路径 | 说明 |
|------|------|------|
| 页面与交互 | `src/react/performance-panel-demo/PerformancePanelDemo.tsx` | **当前默认页为第 5 课**（糟糕 vs `memo` 对照）；挂载/停止/重置流程见按钮文案。 |
| 第五课场景组件 | `src/react/performance-panel-demo/Lesson5Scenarios.tsx` | `Lesson5BadBlock`、`Lesson5GoodBlock`、`LESSON5_PARENT_TICK_MS`。 |
| 状态与用户 Timing | `src/react/performance-panel-demo/state.ts` | 第 1～2 课：`runBaselineInteractionBatch`、`runHeavyInteractionBatch`、`runChunkedHeavyInteractionBatch`；第 3 课：输入与防抖相关函数；第 4 课：`runLesson4ForcedReflowBad` / `runLesson4ForcedReflowGood`；第 5 课：`runLesson5ChildRenderWork` 与 `lesson5BadChildWorkRuns` / `lesson5GoodChildWorkRuns`；汇总 `lessonOneStats`、`resetLessonOneStats`。 |
| 样式 | `src/react/performance-panel-demo/style.css` | 含第五课 `.lesson5-scenario` / `.lesson5-child-tag` 等；第四课布局抖动样式仍保留。 |
| 单元测试 | `src/react/performance-panel-demo/state.test.ts` | 覆盖上述 state 行为与统计重置。 |
| 课程数据（可选） | `src/react/performance-panel-demo/curriculum.ts` | **未落地**；多课 Tab/深链时可按 `.ai/specs/README.md` 命名另增规格版本。 |

> 说明：新增子课或改版时，须同步更新本 Spec 章节与上表，避免「文档与入口页不一致」。

## 非目标

- 不要求引入后端压测平台或真实生产流量回放系统。
- 不要求一次课程覆盖 Lighthouse、Memory、Network 全量能力（可在后续课程扩展）。
- 不承诺不同机器与浏览器版本得到完全一致的绝对耗时，验收以“同机同流程前后对比”趋势为准。

## 验收

- 学习者可按课程说明独立完成至少 3 类性能问题的定位与修复验证（长任务、重复渲染、布局/样式开销）。
- 每类问题均有“修复前后 Performance 录制证据”，且能说明核心指标变化（耗时、任务长度、渲染频次等）。
- 课程演示页面可通过 `npm start` 正常运行；课程相关测试通过。

