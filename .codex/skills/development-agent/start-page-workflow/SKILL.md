---
name: start-page-workflow
description: Imported from Cursor command $baseName; use when this command workflow should be followed exactly.
---

# 启动页面开发流程

根据以下用户输入启动页面开发工作流：

`$ARGUMENTS`

严格按下面顺序执行，除非用户明确要求跳过某一步，否则不得跳步：

## 目标流程

1. 先交给 `ui-agent`
2. 再交给 `architecture-agent`
3. 最后交给 `development-agent`

## 执行要求

### Step 1：先做 UI 解析

先使用 `ui-agent` 处理用户提供的设计稿、截图、页面描述或设计稿链接，产出以下内容：

- 页面布局的详细文字描述
- 页面截图或截图说明
- 设计稿地址 / 节点信息
- 关键区域、组件、间距、颜色、字体、圆角、边框、阴影、图标、图片等实现依据
- 对开发有影响的交互、状态说明
- 所有不明确或不确定的问题清单

如果设计稿、截图、交互或状态有任何不明确点：

- 必须先向用户提问
- 等用户明确答复后再继续
- 在所有疑问未解决前，不得进入架构或开发阶段

### Step 2：再做架构设计

当 `ui-agent` 已输出完整结果，且所有疑问都已澄清后，再把完整 UI 产出交给 `architecture-agent`。

`architecture-agent` 必须基于 `ui-agent` 的结果进行架构设计，输出：

- 页面骨架文件
- Layout / 页面入口 / 插槽划分
- 插槽清单
- 每个文件的“本文件需实现”
- 公共组件复用/抽取说明
- 每个插槽/文件对应的 UI 依据（布局描述、截图、设计稿地址/节点）

### Step 3：最后做开发实现

当架构说明完整后，再把单条开发任务交给 `development-agent`。

每条开发任务必须至少包含：

- 文件路径
- 本块需实现
- `ui-agent` 输出的布局说明
- `ui-agent` 提供的截图或截图说明
- 设计稿地址 / 节点信息
- 已确认的交互说明
- 当前块对应的架构说明

`development-agent` 必须遵守：

- 以 `ui-agent` 的页面布局说明、截图、设计稿地址为依据做 1:1 还原
- 有任何不明确交互或需求时，先向用户提问
- 所有疑问清零前，不得开始开发

## 输出方式

请按以下结构组织你的输出：

### 1. 当前阶段
明确说明当前正在执行 `ui-agent`、`architecture-agent` 还是 `development-agent`。

### 2. 当前产出
输出该阶段的结果，确保信息完整可传递到下一阶段。

### 3. 待确认问题
如果有任何不明确点，列成清单并等待用户回复；不要继续往下执行。

### 4. 下一步
如果当前阶段完成且没有未决问题，明确说明下一步应交给哪个 agent。

## 约束

- 不得跳过 `ui-agent` 直接做架构或开发
- 不得跳过 `architecture-agent` 直接进入开发
- 不得带着任何未澄清的问题进入开发
- 不得凭想象补需求
- 页面类任务默认遵循 `ui-agent -> architecture-agent -> development-agent` 的完整流程

参考文档：

- `~/.cursor/workflow/workflow.md`
- `~/.cursor/workflow/agents-workflow-reference.md`
