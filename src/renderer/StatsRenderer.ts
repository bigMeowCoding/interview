import type { GenerationStats } from '../types';

/** 统计小画布：绘制最优/平均距离进化曲线 */
export class StatsRenderer {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  history: { generation: number; best: number; avg: number }[] = [];
  maxPoints = 200;

  constructor(canvas: HTMLCanvasElement, width = 300, height = 120) {
    this.canvas = canvas;
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

    const maxDist = Math.max(...this.history.map((h) => h.avg));
    const minDist = Math.min(...this.history.map((h) => h.best));
    const range = maxDist - minDist || 1;
    const pad = 10;

    const drawLine = (key: 'best' | 'avg', color: string) => {
      this.ctx.beginPath();
      this.ctx.strokeStyle = color;
      this.ctx.lineWidth = 2;
      this.history.forEach((point, i) => {
        const x =
          (i / Math.max(this.history.length - 1, 1)) * (width - pad * 2) + pad;
        const y =
          height -
          pad -
          ((point[key] - minDist) / range) * (height - pad * 2);
        if (i === 0) this.ctx.moveTo(x, y);
        else this.ctx.lineTo(x, y);
      });
      this.ctx.stroke();
    };

    drawLine('avg', 'rgba(149, 165, 166, 0.8)');
    drawLine('best', '#e74c3c');
  }

  clear(): void {
    this.history = [];
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }
}
