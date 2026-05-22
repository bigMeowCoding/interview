# AGENTS.md

本文件为仓库内 **所有 AI Agent** 的共享规则入口（物理路径：`.ai/AGENTS.md`）。

> **规则分离原则**：不依赖特定平台的规则统一写入本文件；只有依赖特定平台（如 Claude Code、Cursor 等）的规则才放入各平台的专属配置文件。

## 语言说明

项目代码和文档使用中文注释，与 Agent 的交互语言为中文。

## `.ai/` 目录用途

`.ai/` 用于存放 **与本仓库协作的 Agent** 相关资料，与业务源码（`src/`）分离。

仓库根目录的 `.claude`、`.codex` 为指向 **`.ai/claude/`**、**`.ai/codex/`** 的符号链接（若存在）。

## 目录结构

| 路径           | 说明                    |
| -------------- | ----------------------- |
| `src/main.jsx` | React 入口              |
| `src/App.jsx`  | 根组件，展示 Hello World |
| `index.html`   | Vite HTML 模板          |
| `vite.config.js` | Vite 配置             |

## 技术栈

- **包管理**: pnpm
- **构建**: Vite 6
- **UI**: React 18

## 常用命令

```bash
pnpm install   # 安装依赖
pnpm dev       # 开发服务器（默认 http://localhost:5173）
pnpm start     # 同 dev
pnpm build     # 生产构建
pnpm preview   # 预览构建产物
```
