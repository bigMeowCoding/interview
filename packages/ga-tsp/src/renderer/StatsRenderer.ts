import type { GenerationStats } from '../types';

const CHART = {
  bg: '#12161f',
  grid: 'rgba(255, 255, 255, 0.06)',
  best: '#ff6b7a',
  avg: '#6b7a94',
  padding: { top: 12, right: 8, bottom: 8, left: 8 },
};

/** 统计小画布：最优/平均距离进化曲线 */
export class StatsRenderer {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  history: { generation: number; best: number; avg: number }[] = [];
  maxPoints: number = 200;

  constructor(canvasId: string, width: number = 300, height: number = 150) {
    const el = document.getElementById(canvasId);
    if (!el || !(el instanceof HTMLCanvasElement)) {
      throw new Error(`Canvas #${canvasId} not found`);
    }
    this.canvas = el;
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

  private drawChartBackground(plotW: number, plotH: number, ox: number, oy: number): void {
    const { ctx } = this;
    ctx.fillStyle = CHART.bg;
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    ctx.strokeStyle = CHART.grid;
    ctx.lineWidth = 1;
    const hLines = 4;
    for (let i = 0; i <= hLines; i++) {
      const y = oy + (plotH * i) / hLines;
      ctx.beginPath();
      ctx.moveTo(ox, y);
      ctx.lineTo(ox + plotW, y);
      ctx.stroke();
    }
  }

  render(): void {
    const { width, height } = this.canvas;
    const { top, right, bottom, left } = CHART.padding;
    const plotW = width - left - right;
    const plotH = height - top - bottom;
    const ox = left;
    const oy = top;

    this.drawChartBackground(plotW, plotH, ox, oy);

    if (this.history.length < 2) return;

    const maxDist = Math.max(...this.history.map((h) => h.avg));
    const minDist = Math.min(...this.history.map((h) => h.best));
    const range = maxDist - minDist || 1;
    const count = this.history.length;

    const drawLine = (key: 'best' | 'avg', color: string, lineWidth: number) => {
      this.ctx.beginPath();
      this.ctx.strokeStyle = color;
      this.ctx.lineWidth = lineWidth;
      this.ctx.lineJoin = 'round';
      this.ctx.lineCap = 'round';
      this.history.forEach((point, i) => {
        const x = ox + (i / Math.max(count - 1, 1)) * plotW;
        const y = oy + plotH - ((point[key] - minDist) / range) * plotH;
        if (i === 0) this.ctx.moveTo(x, y);
        else this.ctx.lineTo(x, y);
      });
      this.ctx.stroke();
    };

    drawLine('avg', CHART.avg, 1.5);
    drawLine('best', CHART.best, 2);
  }

  clear(): void {
    this.history = [];
    const { width, height } = this.canvas;
    this.ctx.fillStyle = CHART.bg;
    this.ctx.fillRect(0, 0, width, height);
  }
}
