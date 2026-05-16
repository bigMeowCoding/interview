# 代码风格

js代码必须有详尽的注释

# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

See [AGENTS.md](../AGENTS.md) for shared development rules.

## 项目宪法

本项目遵循 [constitution.md](./constitution.md)，所有技术决策必须经过"合宪性审查"。

## Claude Code 特定规则

后续新增规则时，**不依赖特定平台的规则统一加入 `AGENTS.md`**，只有依赖 Claude Code 平台特性的规则才加入本文件。

## Superpowers Skills

本项目配置了多个 Superpowers skills，执行任务前应优先使用：

| 场景                           | Skill                                        |
| ------------------------------ | -------------------------------------------- |
| 创意工作（新增功能/组件/行为） | `superpowers:brainstorming`                  |
| 声称工作完成/修复通过前        | `superpowers:verification-before-completion` |
| 遇到 bug/测试失败              | `superpowers:systematic-debugging`           |
| 实现功能或修复 bug 前          | `superpowers:test-driven-development`        |
| 提交/PR 前验证                 | `superpowers:requesting-code-review`         |

## MCP 集成

项目已配置 GitHub MCP (`/.mcp.json`)，可直接调用 GitHub API：

- `mcp__github__issue_write` — 创建/更新 issue
- `mcp__github__add_issue_comment` — 添加 issue 评论
- `mcp__github__create_pull_request` — 创建 PR
- `mcp__github__list_issues` / `mcp__github__list_pull_requests` — 列出 issues/PRs

需要 `GITHUB_TOKEN` 环境变量（通过 `${GITHUB_TOKEN}` 在 `.mcp.json` 中引用）。

## 语言说明

项目代码和文档使用中文注释，交互语言为中文。
