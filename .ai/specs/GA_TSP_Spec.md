# 遗传算法 TSP 可视化 —— 开发 Spec 文档

> 版本: v1.1 | 日期: 2026-05-20 | 适用技术栈: TypeScript + Vite + Canvas 2D + Web Worker  
> 实现位置: `packages/ga-tsp/`

---

## 1. 项目概述

开发一个单页 Web 应用，在浏览器中可视化演示遗传算法求解旅行商问题（TSP）。用户可交互式添加/移动城市，实时调节算法参数，观察进化过程。

**目标用户**：前端开发者学习遗传算法  
**核心体验**：参数可调、实时渲染、结果直观

---

## 2. 技术栈

| 层级 | 技术 | 说明 |
|------|------|------|
| 语言 | TypeScript | 严格模式，所有数据类型显式声明 |
| 构建 | Vite | 纯前端项目，无需后端 |
| 样式 | 原生 CSS | 不引入 UI 框架，减少依赖 |
| 渲染 | HTML5 Canvas 2D | 主画布 + 统计小画布 |
| 并发 | Web Worker | GA 计算线程与主渲染线程分离 |

---

## 3. 文件结构

```
src/
├── main.ts                 # 入口，初始化 App
├── app.ts                  # App 类，协调各模块
├── types.ts                # 全局类型定义
├── config.ts               # 默认参数常量
├── models/
│   ├── City.ts             # 城市模型
│   ├── Individual.ts       # 个体（路径）
│   └── Population.ts       # 种群
├── engine/
│   ├── GAEngine.ts         # 遗传算法引擎（核心）
│   ├── Selection.ts        # 选择策略
│   ├── Crossover.ts        # 交叉算子
│   └── Mutation.ts         # 变异算子
├── renderer/
│   ├── CanvasRenderer.ts   # 主画布渲染器
│   └── StatsRenderer.ts    # 统计面板渲染器
├── worker/
│   └── ga.worker.ts        # Web Worker 入口
└── ui/
    └── ControlPanel.ts     # 控制面板 DOM 操作
```

---

## 4. 类型定义（types.ts）

```typescript
// 坐标点
export interface Point {
  x: number;
  y: number;
}

// 城市
export interface CityData {
  id: number;
  point: Point;
}

// 个体基因型
export type Chromosome = number[]; // 城市 id 的顺序数组

// 算法配置
export interface GAConfig {
  populationSize: number;      // 种群大小，默认 100
  mutationRate: number;        // 变异率 0~1，默认 0.02
  crossoverRate: number;       // 交叉率 0~1，默认 0.9
  elitismCount: number;        // 精英保留数，默认 2
  tournamentSize: number;      // 锦标赛选手数，默认 5
  maxGenerations: number;      // 最大迭代代数，默认 10000
  animationSpeed: number;      // 每帧进化代数 1~10，默认 1
}

// 进化统计
export interface GenerationStats {
  generation: number;
  bestDistance: number;
  avgDistance: number;
  worstDistance: number;
  bestChromosome: Chromosome;
}

// Worker 通信消息类型
export type WorkerMessage =
  | { type: 'INIT'; payload: { cities: CityData[]; config: GAConfig } }
  | { type: 'START' }
  | { type: 'STOP' }
  | { type: 'RESET'; payload: { cities: CityData[] } }
  | { type: 'UPDATE_CONFIG'; payload: Partial<GAConfig> }
  | { type: 'TICK'; payload: GenerationStats }      // Worker -> Main
  | { type: 'BEST'; payload: GenerationStats };     // Worker -> Main
```

---

## 4.5 整体计算逻辑（精要）

**问题**：N 个城市各访问一次并回到起点，求闭合路径总距离最短（TSP）。穷举不可行，用遗传算法在排列空间中启发式搜索。

**线程分工**

| 线程 | 职责 |
|------|------|
| 主线程 `App` | 城市坐标、交互、Canvas/统计绘制 |
| Worker `ga.worker.ts` | `Population` 进化循环，每帧 `postMessage(TICK)` 回传最优路径与距离 |

**核心对象**

- `Chromosome`：城市 id 的排列，如 `[2,0,3,1]`，须为合法排列（无重复、无遗漏）。
- `Individual`：一条路径 + `distance`（欧氏距离闭合回路总长）+ `fitness = 1 / (distance + 1e-6)`（距离越短 fitness 越高）。
- `Population`：`populationSize` 个个体 + 当前 `generation`。

**初始化**：对每个个体随机打乱全部城市 id → `calculateDistance` → 按 fitness 降序排序。

**一代 `evolve()`**

1. 精英保留：适应度前 `elitismCount` 名直接 clone 进新种群。
2. 循环直至满员：锦标赛选父代 A、B → 以 `crossoverRate` 做 OX 或复制 A → `mutationRate` 下 swap 变异 → `calculateDistance` → 入种群。
3. `generation++`，再排序。

**运行时**：`START` 后 Worker 在 `requestAnimationFrame` 中每帧执行 `animationSpeed` 次 `evolve()`，发出 `TICK`（含 `bestChromosome`、best/avg 距离）。主线程画最优路径与进化曲线。

**重置语义**

| 操作 | 行为 |
|------|------|
| **重置** | 城市坐标不变，`population.reset()` 重新随机初始化种群 |
| **新演示** | 保持城市数量与 id，随机重排坐标后 `RESET`，开启新地图 |
| **拖城/加点** | 坐标变化 → `RESET` |
| **改滑块** | `UPDATE_CONFIG` → 用新参数重建 `Population` |

生产路径走 **Worker**；`GAEngine.ts` 为主线程备用，逻辑等价。

---

## 4.6 选择、交叉、变异（精要）

三者均在 `Population.evolve()` 填种群时串联使用（精英个体跳过）。子代染色体变更后**必须**重算 `distance` / `fitness`。

### 选择：锦标赛（`Selection.tournament`）

1. 随机抽 1 个个体为 `best`。
2. 再抽 `tournamentSize - 1` 次（默认共 5 次），每次若 `contender.fitness > best.fitness` 则替换 `best`。
3. 返回 `best.clone()`。

父代 A、B 各调用一次，独立抽样。`tournamentSize` 越大选择压力越强、多样性越低。

### 交叉：顺序交叉 OX（`Crossover.orderCrossover`）

TSP 染色体为排列，普通单点拼接会产生重复/缺失城市。OX 保证子代仍为排列。

1. 随机切点 `start ≤ end`，子代 `[start..end]` 复制自父代 A。
2. 从父代 B 的 `(end+1) % len` 起**环状**扫描 B 的顺序；城市不在 A 片段中则依次填入子代空位（从 `(end+1) % len` 环状推进）。
3. `len ≤ 2` 时退化为 `parentA.clone()`。

以 `crossoverRate`（默认 0.9）决定是否交叉；否则子代 = `parentA.clone()`。

**示例**（`start=2, end=4`）：

```
A: [0,1,|2,3,4|,5]  →  child 中间段固定为 2,3,4
B: 从索引 5 环扫 0,3,5,2,1,4 → 跳过已在片段中的 3,2,4
   填入 0,5,1 → 子代 [5,1,2,3,4,0]
```

### 变异：交换 swap（`Mutation.swap`）

以 `mutationRate`（默认 0.02）为阈值：`Math.random() > rate` 则不变异；否则随机下标 `i`、`j` 交换染色体两格。排列合法性不变，作局部扰动。

### 单个子代流水线

```
锦标赛 → A；锦标赛 → B
  → random < crossoverRate ? OX(A,B) : clone(A)
  → swap 变异（概率 mutationRate）
  → calculateDistance
```

### 调参直觉

| 参数 | 增大 | 减小 |
|------|------|------|
| `tournamentSize` | 父母更优、收敛快 | 选择更随机 |
| `crossoverRate` | 重组多 | 更多复制父代 A |
| `mutationRate` | 探索强、路径抖动大 | 易停滞、依赖交叉 |

---

## 5. 核心模块详细设计

### 5.1 City.ts

```typescript
export class City {
  id: number;
  x: number;
  y: number;

  constructor(id: number, x: number, y: number) {
    this.id = id;
    this.x = x;
    this.y = y;
  }

  // 计算到另一个城市的欧几里得距离
  distanceTo(other: City): number {
    const dx = this.x - other.x;
    const dy = this.y - other.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  // 判断点击是否命中（半径 8px）
  containsPoint(px: number, py: number): boolean {
    const dx = this.x - px;
    const dy = this.y - py;
    return Math.sqrt(dx * dx + dy * dy) <= 8;
  }
}
```

---

### 5.2 Individual.ts

```typescript
import { Chromosome } from '../types';

export class Individual {
  chromosome: Chromosome;
  distance: number = Infinity;
  fitness: number = 0;

  constructor(chromosome: Chromosome) {
    this.chromosome = chromosome;
  }

  // 计算路径总距离（需要外部传入 cities 数组用于查坐标）
  calculateDistance(cities: Map<number, City>): number {
    let dist = 0;
    const len = this.chromosome.length;
    for (let i = 0; i < len; i++) {
      const from = cities.get(this.chromosome[i])!;
      const to = cities.get(this.chromosome[(i + 1) % len])!;
      dist += from.distanceTo(to);
    }
    this.distance = dist;
    this.fitness = 1 / (dist + 1e-6); // 避免除零
    return dist;
  }

  // 深拷贝
  clone(): Individual {
    const ind = new Individual([...this.chromosome]);
    ind.distance = this.distance;
    ind.fitness = this.fitness;
    return ind;
  }
}
```

---

### 5.3 Selection.ts —— 锦标赛选择

```typescript
import { Individual } from '../models/Individual';

export class Selection {
  static tournament(population: Individual[], tournamentSize: number): Individual {
    let best = population[Math.floor(Math.random() * population.length)];
    for (let i = 1; i < tournamentSize; i++) {
      const contender = population[Math.floor(Math.random() * population.length)];
      if (contender.fitness > best.fitness) {
        best = contender;
      }
    }
    return best.clone();
  }
}
```

---

### 5.4 Crossover.ts —— Order Crossover (OX)

**算法步骤**：
1. 随机选择两个切点 `start` 和 `end`（`start < end`）
2. 子代先复制父代 A 的 `[start, end]` 片段到对应位置
3. 从父代 B 中按顺序遍历，将未在子代中出现的城市依次填入剩余位置

```typescript
import { Individual } from '../models/Individual';

export class Crossover {
  static orderCrossover(parentA: Individual, parentB: Individual): Individual {
    const len = parentA.chromosome.length;
    if (len <= 2) return parentA.clone();

    // 随机切点
    let start = Math.floor(Math.random() * len);
    let end = Math.floor(Math.random() * len);
    if (start > end) [start, end] = [end, start];

    // 步骤 1：从 A 复制片段
    const childChrom = new Array(len).fill(-1);
    const segment = new Set(parentA.chromosome.slice(start, end + 1));
    for (let i = start; i <= end; i++) {
      childChrom[i] = parentA.chromosome[i];
    }

    // 步骤 2：从 B 按顺序填充剩余位置
    let currentPos = (end + 1) % len;
    for (let i = 0; i < len; i++) {
      const bIndex = (end + 1 + i) % len;
      const city = parentB.chromosome[bIndex];
      if (!segment.has(city)) {
        childChrom[currentPos] = city;
        currentPos = (currentPos + 1) % len;
      }
    }

    return new Individual(childChrom);
  }
}
```

---

### 5.5 Mutation.ts —— Swap Mutation

```typescript
import { Individual } from '../models/Individual';

export class Mutation {
  static swap(individual: Individual, rate: number): void {
    if (Math.random() > rate) return;
    const len = individual.chromosome.length;
    const i = Math.floor(Math.random() * len);
    const j = Math.floor(Math.random() * len);
    [individual.chromosome[i], individual.chromosome[j]] = 
      [individual.chromosome[j], individual.chromosome[i]];
  }
}
```

---

### 5.6 Population.ts

```typescript
import { Individual } from './Individual';
import { City } from './City';
import { Selection } from '../engine/Selection';
import { Crossover } from '../engine/Crossover';
import { Mutation } from '../engine/Mutation';
import { GAConfig } from '../types';

export class Population {
  individuals: Individual[] = [];
  generation: number = 0;
  cities: Map<number, City>;
  private config: GAConfig;

  constructor(cities: City[], config: GAConfig) {
    this.cities = new Map(cities.map(c => [c.id, c]));
    this.config = config;
    this.initialize();
  }

  // 初始化：随机生成种群
  initialize(): void {
    const cityIds = Array.from(this.cities.keys());
    this.individuals = [];
    for (let i = 0; i < this.config.populationSize; i++) {
      const shuffled = this.shuffle([...cityIds]);
      const ind = new Individual(shuffled);
      ind.calculateDistance(this.cities);
      this.individuals.push(ind);
    }
    this.sortByFitness();
  }

  // 执行一代进化
  evolve(): void {
    const newPopulation: Individual[] = [];
    this.sortByFitness();

    // 1. 精英保留
    for (let i = 0; i < this.config.elitismCount; i++) {
      newPopulation.push(this.individuals[i].clone());
    }

    // 2. 生成子代填满种群
    while (newPopulation.length < this.config.populationSize) {
      const parentA = Selection.tournament(this.individuals, this.config.tournamentSize);
      const parentB = Selection.tournament(this.individuals, this.config.tournamentSize);

      let child: Individual;
      if (Math.random() < this.config.crossoverRate) {
        child = Crossover.orderCrossover(parentA, parentB);
      } else {
        child = parentA.clone();
      }

      Mutation.swap(child, this.config.mutationRate);
      child.calculateDistance(this.cities);
      newPopulation.push(child);
    }

    this.individuals = newPopulation;
    this.generation++;
    this.sortByFitness();
  }

  getBest(): Individual {
    return this.individuals[0];
  }

  getStats() {
    const distances = this.individuals.map(ind => ind.distance);
    return {
      generation: this.generation,
      bestDistance: this.individuals[0].distance,
      avgDistance: distances.reduce((a, b) => a + b, 0) / distances.length,
      worstDistance: distances[distances.length - 1],
      bestChromosome: [...this.individuals[0].chromosome],
    };
  }

  private sortByFitness(): void {
    this.individuals.sort((a, b) => b.fitness - a.fitness); // 适应度降序
  }

  private shuffle<T>(arr: T[]): T[] {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  // 城市改变时重置
  reset(cities: City[]): void {
    this.cities = new Map(cities.map(c => [c.id, c]));
    this.generation = 0;
    this.initialize();
  }
}
```

---

### 5.7 GAEngine.ts

```typescript
import { Population } from '../models/Population';
import { City } from '../models/City';
import { GAConfig, GenerationStats } from '../types';

export class GAEngine {
  population: Population;
  config: GAConfig;
  isRunning: boolean = false;
  private animationId: number | null = null;
  private onTick: (stats: GenerationStats) => void;

  constructor(
    cities: City[],
    config: GAConfig,
    onTick: (stats: GenerationStats) => void
  ) {
    this.config = config;
    this.onTick = onTick;
    this.population = new Population(cities, config);
  }

  start(): void {
    if (this.isRunning) return;
    this.isRunning = true;
    this.loop();
  }

  stop(): void {
    this.isRunning = false;
    if (this.animationId !== null) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }

  private loop(): void {
    if (!this.isRunning) return;

    // 每帧可执行多代，由 animationSpeed 控制
    for (let i = 0; i < this.config.animationSpeed; i++) {
      this.population.evolve();
    }

    const stats = this.population.getStats();
    this.onTick(stats);

    if (stats.generation >= this.config.maxGenerations) {
      this.stop();
      return;
    }

    this.animationId = requestAnimationFrame(() => this.loop());
  }

  updateConfig(newConfig: Partial<GAConfig>): void {
    this.config = { ...this.config, ...newConfig };
    this.population = new Population(
      Array.from(this.population.cities.values()),
      this.config
    );
  }

  updateCities(cities: City[]): void {
    this.population.reset(cities);
  }
}
```

---

### 5.8 CanvasRenderer.ts

```typescript
import { City } from '../models/City';
import { Chromosome } from '../types';

export class CanvasRenderer {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  width: number;
  height: number;

  constructor(canvasId: string, width: number = 800, height: number = 600) {
    this.canvas = document.getElementById(canvasId) as HTMLCanvasElement;
    this.canvas.width = width;
    this.canvas.height = height;
    this.ctx = this.canvas.getContext('2d')!;
    this.width = width;
    this.height = height;
  }

  clear(): void {
    this.ctx.clearRect(0, 0, this.width, this.height);
  }

  drawCities(cities: City[], hoverId?: number): void {
    cities.forEach(city => {
      this.ctx.beginPath();
      this.ctx.arc(city.x, city.y, 6, 0, Math.PI * 2);
      this.ctx.fillStyle = city.id === hoverId ? '#ff6b6b' : '#4ecdc4';
      this.ctx.fill();
      this.ctx.strokeStyle = '#2c3e50';
      this.ctx.lineWidth = 2;
      this.ctx.stroke();

      // 城市编号
      this.ctx.fillStyle = '#2c3e50';
      this.ctx.font = '12px sans-serif';
      this.ctx.fillText(`${city.id}`, city.x + 10, city.y - 10);
    });
  }

  drawPath(chromosome: Chromosome, cities: City[], color: string = '#ff6b6b', width: number = 2): void {
    if (chromosome.length === 0) return;
    const cityMap = new Map(cities.map(c => [c.id, c]));

    this.ctx.beginPath();
    this.ctx.strokeStyle = color;
    this.ctx.lineWidth = width;
    this.ctx.lineJoin = 'round';

    const start = cityMap.get(chromosome[0])!;
    this.ctx.moveTo(start.x, start.y);

    for (let i = 1; i < chromosome.length; i++) {
      const city = cityMap.get(chromosome[i])!;
      this.ctx.lineTo(city.x, city.y);
    }
    // 回到起点
    this.ctx.lineTo(start.x, start.y);
    this.ctx.stroke();
  }

  // 绘制半透明历史路径（可选）
  drawGhostPaths(chromosomes: Chromosome[], cities: City[]): void {
    chromosomes.forEach((chrom, idx) => {
      const alpha = 0.1 * (1 - idx / chromosomes.length);
      this.drawPath(chrom, cities, `rgba(78, 205, 196, ${alpha})`, 1);
    });
  }
}
```

---

### 5.9 StatsRenderer.ts

```typescript
import { GenerationStats } from '../types';

export class StatsRenderer {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  history: { generation: number; best: number; avg: number }[] = [];
  maxPoints: number = 200;

  constructor(canvasId: string, width: number = 300, height: number = 150) {
    this.canvas = document.getElementById(canvasId) as HTMLCanvasElement;
    this.canvas.width = width;
    this.canvas.height = height;
    this.ctx = this.canvas.getContext('2d')!;
  }

  push(stats: GenerationStats): void {
    this.history.push({
      generation: stats.generation,
      best: stats.bestDistance,
      avg: stats.avgDistance,
    });
    if (this.history.length > this.maxPoints) {
      this.history.shift();
    }
    this.render();
  }

  render(): void {
    const { width, height } = this.canvas;
    this.ctx.clearRect(0, 0, width, height);

    if (this.history.length < 2) return;

    const maxDist = Math.max(...this.history.map(h => h.avg));
    const minDist = Math.min(...this.history.map(h => h.best));
    const range = maxDist - minDist || 1;

    const drawLine = (key: 'best' | 'avg', color: string) => {
      this.ctx.beginPath();
      this.ctx.strokeStyle = color;
      this.ctx.lineWidth = 2;
      this.history.forEach((point, i) => {
        const x = (i / (this.maxPoints - 1)) * width;
        const y = height - ((point[key] - minDist) / range) * (height - 20) - 10;
        if (i === 0) this.ctx.moveTo(x, y);
        else this.ctx.lineTo(x, y);
      });
      this.ctx.stroke();
    };

    drawLine('avg', '#95a5a6'); // 灰色：平均距离
    drawLine('best', '#e74c3c'); // 红色：最优距离
  }

  clear(): void {
    this.history = [];
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }
}
```

---

## 6. UI 布局与交互设计

### 6.1 HTML 结构

```html
<div id="app">
  <!-- 控制面板 -->
  <div id="control-panel">
    <div class="param-group">
      <label>种群大小: <span id="val-pop">100</span></label>
      <input type="range" id="pop-size" min="20" max="500" value="100">
    </div>
    <div class="param-group">
      <label>变异率: <span id="val-mut">0.02</span></label>
      <input type="range" id="mut-rate" min="0" max="0.5" step="0.01" value="0.02">
    </div>
    <div class="param-group">
      <label>进化速度: <span id="val-speed">1</span></label>
      <input type="range" id="anim-speed" min="1" max="50" value="1">
    </div>
    <div class="buttons">
      <button id="btn-start">开始</button>
      <button id="btn-stop">暂停</button>
      <button id="btn-reset">重置</button>
      <button id="btn-new-demo">新演示</button>
    </div>
    <div class="stats-text">
      <div>代数: <span id="stat-gen">0</span></div>
      <div>最优距离: <span id="stat-best">-</span></div>
      <div>平均距离: <span id="stat-avg">-</span></div>
    </div>
  </div>

  <!-- 主画布 -->
  <canvas id="main-canvas"></canvas>

  <!-- 统计画布 -->
  <canvas id="stats-canvas"></canvas>
</div>
```

### 6.2 交互行为

| 事件 | 行为 |
|------|------|
| **画布单击** | 在点击位置添加新城市（id 自增） |
| **画布拖拽** | 按住城市拖拽移动，释放后重新进化（`engine.updateCities()`） |
| **滑块变化** | 实时更新配置，暂停状态下重置种群；运行状态下下一帧生效 |
| **开始按钮** | 调用 `engine.start()` |
| **暂停按钮** | 调用 `engine.stop()` |
| **重置按钮** | 保持当前城市坐标，重置种群为第 0 代 |
| **新演示按钮** | 暂停进化；保持城市数量与 id，随机重排坐标后重置种群与统计 |

---

## 7. Web Worker 方案（ga.worker.ts）

**为什么需要**：当 `animationSpeed > 10` 或 `populationSize > 200` 时，计算可能阻塞 UI。Worker 负责纯计算，主线程负责渲染。

```typescript
// ga.worker.ts
import { Population } from '../models/Population';
import { City } from '../models/City';
import { GAConfig, WorkerMessage, GenerationStats } from '../types';

let population: Population | null = null;
let config: GAConfig;
let running = false;

self.onmessage = (e: MessageEvent<WorkerMessage>) => {
  const msg = e.data;

  switch (msg.type) {
    case 'INIT':
      const cities = msg.payload.cities.map(c => new City(c.id, c.point.x, c.point.y));
      config = msg.payload.config;
      population = new Population(cities, config);
      break;

    case 'START':
      running = true;
      loop();
      break;

    case 'STOP':
      running = false;
      break;

    case 'RESET':
      if (!population) return;
      const newCities = msg.payload.cities.map(c => new City(c.id, c.point.x, c.point.y));
      population.reset(newCities);
      break;

    case 'UPDATE_CONFIG':
      if (!population) return;
      config = { ...config, ...msg.payload };
      // 重新初始化种群
      const currentCities = Array.from(population.cities.values());
      population = new Population(currentCities, config);
      break;
  }
};

function loop() {
  if (!running || !population) return;

  for (let i = 0; i < config.animationSpeed; i++) {
    population.evolve();
  }

  const stats = population.getStats();
  self.postMessage({ type: 'TICK', payload: stats });

  if (stats.generation < config.maxGenerations) {
    requestAnimationFrame(loop);
  } else {
    running = false;
  }
}
```

**主线程与 Worker 通信封装**：

```typescript
// GAWorkerProxy.ts
export class GAWorkerProxy {
  private worker: Worker;
  private onTick: (stats: GenerationStats) => void;

  constructor(onTick: (stats: GenerationStats) => void) {
    this.onTick = onTick;
    this.worker = new Worker(new URL('./worker/ga.worker.ts', import.meta.url), {
      type: 'module',
    });
    this.worker.onmessage = (e) => {
      if (e.data.type === 'TICK') this.onTick(e.data.payload);
    };
  }

  init(cities: City[], config: GAConfig) {
    this.worker.postMessage({ type: 'INIT', payload: { cities, config } });
  }

  start() { this.worker.postMessage({ type: 'START' }); }
  stop() { this.worker.postMessage({ type: 'STOP' }); }
  reset(cities: City[]) { this.worker.postMessage({ type: 'RESET', payload: { cities } }); }
  updateConfig(config: Partial<GAConfig>) {
    this.worker.postMessage({ type: 'UPDATE_CONFIG', payload: config });
  }

  terminate() { this.worker.terminate(); }
}
```

---

## 8. App.ts 主控制器

```typescript
import { City } from './models/City';
import { GAConfig, GenerationStats } from './types';
import { CanvasRenderer } from './renderer/CanvasRenderer';
import { StatsRenderer } from './renderer/StatsRenderer';
import { GAWorkerProxy } from './GAWorkerProxy';
import { DEFAULT_CONFIG } from './config';

export class App {
  private cities: City[] = [];
  private nextCityId = 0;
  private renderer: CanvasRenderer;
  private statsRenderer: StatsRenderer;
  private worker: GAWorkerProxy;
  private isRunning = false;
  private bestChromosome: number[] = [];
  private draggedCity: City | null = null;

  constructor() {
    this.renderer = new CanvasRenderer('main-canvas', 900, 650);
    this.statsRenderer = new StatsRenderer('stats-canvas', 300, 150);
    this.worker = new GAWorkerProxy((stats) => this.handleTick(stats));
    this.bindEvents();

    // 初始生成 15 个随机城市
    this.generateRandomCities(15);
    this.worker.init(this.cities, DEFAULT_CONFIG);
  }

  private handleTick(stats: GenerationStats): void {
    this.bestChromosome = stats.bestChromosome;
    this.renderer.clear();
    this.renderer.drawCities(this.cities);
    this.renderer.drawPath(this.bestChromosome, this.cities, '#e74c3c', 3);
    this.statsRenderer.push(stats);
    this.updateDOMStats(stats);
  }

  private generateRandomCities(count: number): void {
    const padding = 50;
    for (let i = 0; i < count; i++) {
      this.cities.push(new City(
        this.nextCityId++,
        padding + Math.random() * (this.renderer.width - padding * 2),
        padding + Math.random() * (this.renderer.height - padding * 2)
      ));
    }
  }

  private bindEvents(): void {
    const canvas = this.renderer.canvas;

    // 添加/拖拽城市
    canvas.addEventListener('mousedown', (e) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const clicked = this.cities.find(c => c.containsPoint(x, y));
      if (clicked) {
        this.draggedCity = clicked;
      } else {
        this.cities.push(new City(this.nextCityId++, x, y));
        this.resetEngine();
      }
    });

    canvas.addEventListener('mousemove', (e) => {
      if (!this.draggedCity) return;
      const rect = canvas.getBoundingClientRect();
      this.draggedCity.x = e.clientX - rect.left;
      this.draggedCity.y = e.clientY - rect.top;
      this.resetEngine();
    });

    canvas.addEventListener('mouseup', () => {
      this.draggedCity = null;
    });

    // 按钮事件
    document.getElementById('btn-start')!.onclick = () => {
      this.isRunning = true;
      this.worker.start();
    };
    document.getElementById('btn-stop')!.onclick = () => {
      this.isRunning = false;
      this.worker.stop();
    };
    document.getElementById('btn-reset')!.onclick = () => {
      this.worker.reset(this.cities);
      this.statsRenderer.clear();
    };
    document.getElementById('btn-clear')!.onclick = () => {
      this.cities = [];
      this.nextCityId = 0;
      this.worker.reset(this.cities);
      this.renderer.clear();
      this.statsRenderer.clear();
    };

    // 滑块事件（防抖，200ms）
    const sliders = ['pop-size', 'mut-rate', 'anim-speed'];
    sliders.forEach(id => {
      const el = document.getElementById(id) as HTMLInputElement;
      el.addEventListener('input', () => {
        this.updateConfigFromDOM();
      });
    });
  }

  private resetEngine(): void {
    this.worker.reset(this.cities);
    if (this.isRunning) this.worker.start();
  }

  private updateConfigFromDOM(): void {
    const config: Partial<GAConfig> = {
      populationSize: parseInt((document.getElementById('pop-size') as HTMLInputElement).value),
      mutationRate: parseFloat((document.getElementById('mut-rate') as HTMLInputElement).value),
      animationSpeed: parseInt((document.getElementById('anim-speed') as HTMLInputElement).value),
    };
    this.worker.updateConfig(config);
    // 更新显示值
    document.getElementById('val-pop')!.textContent = String(config.populationSize);
    document.getElementById('val-mut')!.textContent = String(config.mutationRate);
    document.getElementById('val-speed')!.textContent = String(config.animationSpeed);
  }

  private updateDOMStats(stats: GenerationStats): void {
    document.getElementById('stat-gen')!.textContent = String(stats.generation);
    document.getElementById('stat-best')!.textContent = stats.bestDistance.toFixed(2);
    document.getElementById('stat-avg')!.textContent = stats.avgDistance.toFixed(2);
  }
}
```

---

## 9. 默认配置（config.ts）

```typescript
import { GAConfig } from './types';

export const DEFAULT_CONFIG: GAConfig = {
  populationSize: 100,
  mutationRate: 0.02,
  crossoverRate: 0.9,
  elitismCount: 2,
  tournamentSize: 5,
  maxGenerations: 100000, // 实际上无限，靠用户暂停控制
  animationSpeed: 1,
};
```

---

## 10. 验收标准

| 检查项 | 标准 |
|--------|------|
| **功能** | 可添加/拖拽城市，算法自动寻找最短路径 |
| **可视化** | 城市点、最优路径连线、进化曲线图正常显示 |
| **交互** | 参数实时可调，调节后算法正确响应 |
| **性能** | 50 个城市 + 种群 200，帧率保持 30fps 以上 |
| **正确性** | 路径无重复城市，最终收敛到合理短路径 |
| **Worker** | 计算不阻塞 UI，页面可流畅交互 |

---

## 11. 开发顺序建议

1. **搭建骨架**：Vite 项目 + HTML 结构 + CSS 布局
2. **实现 City + Individual**：先做静态绘制和距离计算
3. **实现 Population**：随机种群 + 一代进化，控制台打印距离验证
4. **接入渲染**：把最优路径画到 Canvas 上
5. **添加交互**：城市添加/拖拽 + 按钮控制
6. **接入 Worker**：把计算逻辑迁移到 Web Worker
7. **统计面板**：进化曲线 + 参数显示
8. **调参优化**：确保不同参数组合下算法表现合理
