import { City } from '../models/City';
import type { Chromosome } from '../types';

const COLORS = {
  cityFill: '#3dd6c6',
  cityHover: '#ff6b7a',
  cityStroke: '#1a2a3a',
  path: '#e85d6f',
  pathGlow: 'rgba(232, 93, 111, 0.35)',
  label: '#4a5568',
  grid: 'rgba(100, 120, 150, 0.12)',
};

/** 主画布：城市与路径绘制 */
export class CanvasRenderer {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  width: number;
  height: number;

  constructor(canvasId: string, width: number = 800, height: number = 600) {
    const el = document.getElementById(canvasId);
    if (!el || !(el instanceof HTMLCanvasElement)) {
      throw new Error(`Canvas #${canvasId} not found`);
    }
    this.canvas = el;
    this.canvas.width = width;
    this.canvas.height = height;
    this.ctx = this.canvas.getContext('2d')!;
    this.width = width;
    this.height = height;
  }

  clear(): void {
    this.drawBackground();
  }

  /** 渐变底 + 点阵网格 */
  private drawBackground(): void {
    const { ctx, width, height } = this;
    const bg = ctx.createLinearGradient(0, 0, width, height);
    bg.addColorStop(0, '#f4f7fb');
    bg.addColorStop(0.5, '#eef2f7');
    bg.addColorStop(1, '#e6ecf3');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, width, height);

    const step = 40;
    ctx.fillStyle = COLORS.grid;
    for (let x = step; x < width; x += step) {
      for (let y = step; y < height; y += step) {
        ctx.beginPath();
        ctx.arc(x, y, 1.2, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  drawCities(cities: City[], hoverId?: number): void {
    cities.forEach((city) => {
      const isHover = city.id === hoverId;
      const r = isHover ? 8 : 7;

      this.ctx.beginPath();
      this.ctx.arc(city.x, city.y, r + 3, 0, Math.PI * 2);
      this.ctx.fillStyle = isHover
        ? 'rgba(255, 107, 122, 0.2)'
        : 'rgba(61, 214, 198, 0.18)';
      this.ctx.fill();

      const grad = this.ctx.createRadialGradient(
        city.x - 2,
        city.y - 2,
        0,
        city.x,
        city.y,
        r,
      );
      grad.addColorStop(0, isHover ? '#ff9aa5' : '#6ee8dc');
      grad.addColorStop(1, isHover ? COLORS.cityHover : COLORS.cityFill);

      this.ctx.beginPath();
      this.ctx.arc(city.x, city.y, r, 0, Math.PI * 2);
      this.ctx.fillStyle = grad;
      this.ctx.fill();
      this.ctx.strokeStyle = COLORS.cityStroke;
      this.ctx.lineWidth = 1.5;
      this.ctx.stroke();

      this.ctx.fillStyle = COLORS.label;
      this.ctx.font = '500 11px "JetBrains Mono", ui-monospace, monospace';
      this.ctx.fillText(`${city.id}`, city.x + r + 4, city.y - r - 2);
    });
  }

  drawPath(
    chromosome: Chromosome,
    cities: City[],
    color: string = COLORS.path,
    width: number = 2.5,
  ): void {
    if (chromosome.length === 0) return;
    const cityMap = new Map(cities.map((c) => [c.id, c]));

    const start = cityMap.get(chromosome[0])!;
    this.ctx.save();
    this.ctx.shadowColor = COLORS.pathGlow;
    this.ctx.shadowBlur = 10;
    this.ctx.beginPath();
    this.ctx.strokeStyle = color;
    this.ctx.lineWidth = width;
    this.ctx.lineCap = 'round';
    this.ctx.lineJoin = 'round';
    this.ctx.moveTo(start.x, start.y);

    for (let i = 1; i < chromosome.length; i++) {
      const city = cityMap.get(chromosome[i])!;
      this.ctx.lineTo(city.x, city.y);
    }
    this.ctx.lineTo(start.x, start.y);
    this.ctx.stroke();
    this.ctx.restore();

    this.ctx.beginPath();
    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
    this.ctx.lineWidth = 1;
    this.ctx.moveTo(start.x, start.y);
    for (let i = 1; i < chromosome.length; i++) {
      const city = cityMap.get(chromosome[i])!;
      this.ctx.lineTo(city.x, city.y);
    }
    this.ctx.lineTo(start.x, start.y);
    this.ctx.stroke();
  }

  drawGhostPaths(chromosomes: Chromosome[], cities: City[]): void {
    chromosomes.forEach((chrom, idx) => {
      const alpha = 0.12 * (1 - idx / chromosomes.length);
      this.drawPath(chrom, cities, `rgba(61, 214, 198, ${alpha})`, 1);
    });
  }
}
