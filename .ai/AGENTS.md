# AGENTS.md

本文件为仓库内 **所有 AI Agent** 的共享规则入口（物理路径：`.ai/AGENTS.md`）。原 **`.ai/claude/CLAUDE.md`** 中的通用规则已并入本文件；Claude Code 仍可在 **`.ai/claude/CLAUDE.md`** 看到极简跳转说明。

> **规则分离原则**：不依赖特定平台的规则统一写入本文件；只有依赖特定平台（如 Claude Code、Cursor 等）的规则才放入各平台的专属配置文件。

## 代码风格

JavaScript 代码必须有详尽的注释。

## 项目宪法

本项目遵循 **[`constitution.md`](./constitution.md)**，所有技术决策须经过「合宪性审查」。

## Superpowers Skills

配置了多个 Superpowers skills，执行任务前应优先使用：

| 场景                           | Skill                                        |
| ------------------------------ | -------------------------------------------- |
| 创意工作（新增功能/组件/行为） | `superpowers:brainstorming`                  |
| 声称工作完成/修复通过前        | `superpowers:verification-before-completion` |
| 遇到 bug/测试失败              | `superpowers:systematic-debugging`           |
| 实现功能或修复 bug 前          | `superpowers:test-driven-development`        |
| 提交/PR 前验证                 | `superpowers:requesting-code-review`         |

## MCP 集成

项目已配置 GitHub MCP（`/.mcp.json`），可直接调用 GitHub API：

- `mcp__github__issue_write` — 创建/更新 issue
- `mcp__github__add_issue_comment` — 添加 issue 评论
- `mcp__github__create_pull_request` — 创建 PR
- `mcp__github__list_issues` / `mcp__github__list_pull_requests` — 列出 issues/PRs

需要 `GITHUB_TOKEN` 环境变量（通过 `${GITHUB_TOKEN}` 在 `.mcp.json` 中引用）。

## 语言说明

项目代码和文档使用中文注释，与 Agent 的交互语言为中文。

## `.ai/` 目录用途

`.ai/` 用于存放 **与本仓库协作的 Agent** 相关资料，与业务源码（`src/`、`packages/`）分离，便于版本管理与约定。本 `AGENTS.md` 亦位于此处，并汇总全仓库级 Agent 规则。

### 建议在本目录存放的内容

| 类型             | 说明                                                                |
| ---------------- | ------------------------------------------------------------------- |
| 提示词 / 草稿    | 可复用的系统提示、角色说明、检查清单草稿                            |
| 工作流笔记       | 多步骤任务拆解、验收标准、联调说明（非正式文档时可放此处）          |
| Agent 产出草稿   | 设计速记、调研摘录；定稿后应迁入正式文档或删除冗余                  |
| 本地工具脚本说明 | 若仅服务 Agent 流程，可在此记录用法（脚本本身可仍放在仓库其他目录） |

### 不建议放入的内容

- 密钥、令牌、Cookie、内网地址等敏感信息
- 与 Agent 无关的大量业务文档（应使用项目既定文档位置）
- 体积过大的二进制或日志（应使用 `.gitignore` 排除或外部存储）

### 维护约定

- 新增子目录时在本文件或子目录简短 `README` 中写一句用途即可。
- 定期清理过期草稿，避免 `.ai/` 成为不可维护的堆栈。

### 本仓库的 Agent 配置位置

| 路径                  | 说明                                                                            |
| --------------------- | ------------------------------------------------------------------------------- |
| `.ai/specs/`          | 可验收规格：文件名须带 **`YYYY-MM-DD-`** 前缀，规则见 **`.ai/specs/README.md`** |
| `.ai/claude/`         | Claude Code：`CLAUDE.md`（跳转）、`settings*.json`、`hooks/`、`skills/`         |
| `.ai/constitution.md` | 项目开发宪法（全仓 Agent 须遵循）                                               |
| `.ai/codex/`          | Codex skills（如 `development-agent`、`sum`）                                   |

仓库根目录的 `.claude`、`.codex` 为指向以上目录的**符号链接**，便于工具按默认路径解析；以 `.ai/` 下为唯一真实副本。

## 开发原则

**TDD 优先**：实现任何功能或修复任何 bug 时，先编写测试用例，再编写实现代码。测试通过后再进行重构或优化。

## 目录结构

### src/ — 主要实现

| 目录                | 内容                                                                                                                                                                                                             |
| ------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `basic/`            | JS 基础：`myCall`、`myBind`、`instanceof`、`debounce`、`throttle`、`mockNew`、`lazy`（React lazy loading）、`ajax`                                                                                               |
| `sort/`             | `merge-sort`、`quick-sort` 原地排序实现                                                                                                                                                                          |
| `promise/`          | `promise.js`（Promise A+ 实现）、`lazyMan.js`、`schedule.js`（并发限制器）、`imageLoad.js`                                                                                                                       |
| `react/`            | 三个子模块：`**redux/**`（手写 Redux：`createStore`、`Provider`、`connect`）；`**router/**`（基于 hash 的路由：`HashRouter`、`Route`、`Link`、`RouterContext`）；`**reactive/**`（`ref`、`computed` 响应式系统） |
| `designPattern/`    | `eventemitter`、`observer`、`publish-subscribe`、`factory`                                                                                                                                                       |
| `inherit/`          | 原型链、构造函数、组合继承等继承模式                                                                                                                                                                             |
| `clone/`            | `deepClone` — 支持循环引用的深拷贝                                                                                                                                                                               |
| `compose/`          | 函数组合工具                                                                                                                                                                                                     |
| `data-constructor/` | `max-heap.js`、事件发射器等数据结构                                                                                                                                                                              |
| `leetcode/`         | 按题号/名称组织的 LeetCode 题目（如 `146-LRU/`、`215-数组中第k个最大元素/`）                                                                                                                                     |
| `array/`、`object/` | 数组/对象工具函数                                                                                                                                                                                                |
| `timer/`            | `setTimeout`、`setInterval` polyfill                                                                                                                                                                             |
| `react/canvas/`     | Canvas 裁剪、水印等演示                                                                                                                                                                                          |
| `react/counter/`    | 简单 React counter 演示                                                                                                                                                                                          |
| `optimization/`     | 算法优化问题（如 `three-sum`）                                                                                                                                                                                   |
| `funcParticle/`     | 函数式编程工具                                                                                                                                                                                                   |
| `file/`             | FileReader 工具                                                                                                                                                                                                  |

### packages/ — 子项目（pnpm workspace）

| 包           | 用途                     |
| ------------ | ------------------------ |
| `mini-vite/` | 简化版 Vite 实现         |
| `ssr/`       | 基于 webpack 的 SSR 演示 |
| `webpack/`   | Webpack 配置示例         |
| `webpack2/`  | 额外 webpack 配置        |
| `ga-tsp/`    | 遗传算法 TSP 可视化（Vite + Canvas + Worker） |

## 技术栈

- **运行时**: Node.js，ESM（`package.json` 中 `"type": "module"`）
- **构建**: Vite
- **测试**: Vitest
- **UI**: React 18、Ant Design、styled-components
- **语言**: JavaScript + TypeScript（`src/react/` 和 `src/basic/` 中的 `.ts` / `.tsx` 文件）

## 常用命令

```bash
npm start                        # 启动 Vite 开发服务器（端口 5173）
npx vitest run src/<path>        # 运行单个测试文件
npx vitest run                   # 运行所有测试
```

测试使用 Vitest，`.test.js` / `.test.ts` 文件与源码同目录放置。
