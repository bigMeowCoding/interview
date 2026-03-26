# AGENTS.md

This file provides shared rules for all AI agents working in this repository.

> **规则分离原则**: 不依赖特定平台的规则统一加入本文件；只有依赖特定平台（如 Claude Code、Cursor 等）的规则才加入各平台的专属配置文件。

## 开发原则

**TDD 优先**：实现任何功能或修复任何 bug 时，先编写测试用例，再编写实现代码。测试通过后再进行重构或优化。

## 目录结构

### src/ — 主要实现

| 目录 | 内容 |
|---|---|
| `basic/` | JS 基础：`myCall`、`myBind`、`instanceof`、`debounce`、`throttle`、`mockNew`、`lazy`（React lazy loading）、`ajax` |
| `sort/` | `merge-sort`、`quick-sort` 原地排序实现 |
| `promise/` | `promise.js`（Promise A+ 实现）、`lazyMan.js`、`schedule.js`（并发限制器）、`imageLoad.js` |
| `react/` | 三个子模块：`**redux/**`（手写 Redux：`createStore`、`Provider`、`connect`）；`**router/**`（基于 hash 的路由：`HashRouter`、`Route`、`Link`、`RouterContext`）；`**reactive/**`（`ref`、`computed` 响应式系统）|
| `designPattern/` | `eventemitter`、`observer`、`publish-subscribe`、`factory` |
| `inherit/` | 原型链、构造函数、组合继承等继承模式 |
| `clone/` | `deepClone` — 支持循环引用的深拷贝 |
| `compose/` | 函数组合工具 |
| `data-constructor/` | `max-heap.js`、事件发射器等数据结构 |
| `leetcode/` | 按题号/名称组织的 LeetCode 题目（如 `146-LRU/`、`215-数组中第k个最大元素/`） |
| `array/`、`object/` | 数组/对象工具函数 |
| `timer/` | `setTimeout`、`setInterval` polyfill |
| `react/canvas/` | Canvas 裁剪、水印等演示 |
| `react/counter/` | 简单 React counter 演示 |
| `optimization/` | 算法优化问题（如 `three-sum`） |
| `funcParticle/` | 函数式编程工具 |
| `file/` | FileReader 工具 |

### packages/ — 子项目（pnpm workspace）

| 包 | 用途 |
|---|---|
| `mini-vite/` | 简化版 Vite 实现 |
| `ssr/` | 基于 webpack 的 SSR 演示 |
| `webpack/` | Webpack 配置示例 |
| `webpack2/` | 额外 webpack 配置 |

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
