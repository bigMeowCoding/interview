# ga-tsp

遗传算法求解旅行商问题（TSP）的浏览器可视化演示。

## 技术栈

TypeScript + Vite + Canvas 2D + Web Worker

## 命令

```bash
# 在仓库根目录
pnpm install

# 进入本包
cd packages/ga-tsp
pnpm dev      # 开发服务器 http://localhost:5174
pnpm build    # 生产构建
```

## 交互

- 单击画布：添加城市
- 拖拽城市：移动后重新进化
- 侧栏滑块：调节种群大小、变异率、进化速度
- 开始 / 暂停 / 重置（同布局重新进化）/ 新演示（随机重排城市位置）

规格说明见 [`.ai/specs/GA_TSP_Spec.md`](../../.ai/specs/GA_TSP_Spec.md)。
