import type { City } from '../models/City';
import type { Chromosome } from '../types';

/** 主画布：绘制城市点与最优路径 */
export class CanvasRenderer {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  width: number;
  height: number;

  constructor(canvas: HTMLCanvasElement, width = 900, height = 650) {
    this.canvas = canvas;
    this.canvas.width = width;
    this.canvas.height = height;
    this.ctx = this.canvas.getContext('2d')!;
    this.width = width;
    this.height = height;
  }

  clear(): void {
    this.ctx.clearRect(0, 0, this.width, this.height);
    this.drawGrid();
  }

  /** 绘制背景网格，增强空间感 */
  private drawGrid(): void {
    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
    this.ctx.lineWidth = 1;
    const step = 40;
    for (let x = 0; x <= this.width; x += step) {
      this.ctx.beginPath();
      this.ctx.moveTo(x, 0);
      this.ctx.lineTo(x, this.height);
      this.ctx.stroke();
    }
    for (let y = 0; y <= this.height; y += step) {
      this.ctx.beginPath();
      this.ctx.moveTo(0, y);
      this.ctx.lineTo(this.width, y);
      this.ctx.stroke();
    }
  }

  drawCities(cities: City[], hoverId?: number, dragId?: number): void {
    cities.forEach((city) => {
      const isHover = city.id === hoverId;
      const isDrag = city.id === dragId;
      const radius = isDrag ? 9 : isHover ? 8 : 6;

      this.ctx.beginPath();
      this.ctx.arc(city.x, city.y, radius, 0, Math.PI * 2);
      this.ctx.fillStyle = isDrag
        ? '#ff6b6b'
        : isHover
          ? '#ffd166'
          : '#4ecdc4';
      this.ctx.fill();
      this.ctx.strokeStyle = '#1a2332';
      this.ctx.lineWidth = 2;
      this.ctx.stroke();

      this.ctx.fillStyle = '#e8edf5';
      this.ctx.font = '600 11px "IBM Plex Mono", monospace';
      this.ctx.fillText(String(city.id), city.x + 10, city.y - 10);
    });
  }

  drawPath(
    chromosome: Chromosome,
    cities: City[],
    color = '#ff6b6b',
    width = 2,
  ): void {
    if (chromosome.length === 0) return;
    const cityMap = new Map(cities.map((c) => [c.id, c]));

    this.ctx.beginPath();
    this.ctx.strokeStyle = color;
    this.ctx.lineWidth = width;
    this.ctx.lineJoin = 'round';
    this.ctx.lineCap = 'round';

    const start = cityMap.get(chromosome[0])!;
    this.ctx.moveTo(start.x, start.y);

    for (let i = 1; i < chromosome.length; i++) {
      const city = cityMap.get(chromosome[i])!;
      this.ctx.lineTo(city.x, city.y);
    }
    this.ctx.lineTo(start.x, start.y);
    this.ctx.stroke();
  }
}
