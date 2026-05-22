import { DEFAULT_CONFIG } from './config';
import { GAWorkerProxy } from './GAWorkerProxy';
import { City } from './models/City';
import { CanvasRenderer } from './renderer/CanvasRenderer';
import { StatsRenderer } from './renderer/StatsRenderer';
import type { GAConfig, GenerationStats } from './types';

/** 应用主控制器：协调 UI、Canvas 渲染与 Worker 计算 */
export class App {
  private cities: City[] = [];
  private nextCityId = 0;
  private renderer: CanvasRenderer;
  private statsRenderer: StatsRenderer;
  private worker: GAWorkerProxy;
  private isRunning = false;
  private bestChromosome: number[] = [];
  private draggedCity: City | null = null;
  private hoverCityId: number | undefined;
  private config: GAConfig = { ...DEFAULT_CONFIG };

  constructor() {
    const mainCanvas = document.getElementById('main-canvas') as HTMLCanvasElement;
    const statsCanvas = document.getElementById('stats-canvas') as HTMLCanvasElement;

    this.renderer = new CanvasRenderer(mainCanvas, 900, 650);
    this.statsRenderer = new StatsRenderer(statsCanvas, 280, 120);
    this.worker = new GAWorkerProxy((stats) => this.handleTick(stats));

    this.bindEvents();
    this.generateRandomCities(15);
    this.worker.init(this.cities, this.config);
    this.redraw();
    this.updateCityCount();
  }

  private handleTick(stats: GenerationStats): void {
    this.bestChromosome = stats.bestChromosome;
    this.redraw();
    this.statsRenderer.push(stats);
    this.updateDOMStats(stats);
  }

  private redraw(): void {
    this.renderer.clear();
    if (this.bestChromosome.length > 0) {
      this.renderer.drawPath(this.bestChromosome, this.cities, '#e74c3c', 2.5);
    }
    this.renderer.drawCities(
      this.cities,
      this.hoverCityId,
      this.draggedCity?.id,
    );
  }

  /** 在画布内随机生成 count 个城市 */
  private generateRandomCities(count: number): void {
    const padding = 50;
    for (let i = 0; i < count; i++) {
      this.cities.push(
        new City(
          this.nextCityId++,
          padding + Math.random() * (this.renderer.width - padding * 2),
          padding + Math.random() * (this.renderer.height - padding * 2),
        ),
      );
    }
  }

  /** 保持城市数量与 id，随机重排坐标 */
  private shuffleCityPositions(): void {
    const padding = 50;
    for (const city of this.cities) {
      city.x = padding + Math.random() * (this.renderer.width - padding * 2);
      city.y = padding + Math.random() * (this.renderer.height - padding * 2);
    }
  }

  private bindEvents(): void {
    const canvas = this.renderer.canvas;

    canvas.addEventListener('mousedown', (e) => {
      const { x, y } = this.getCanvasCoords(e);
      const clicked = this.cities.find((c) => c.containsPoint(x, y));
      if (clicked) {
        this.draggedCity = clicked;
      } else {
        this.cities.push(new City(this.nextCityId++, x, y));
        this.resetEngine();
        this.updateCityCount();
      }
    });

    canvas.addEventListener('mousemove', (e) => {
      const { x, y } = this.getCanvasCoords(e);
      if (this.draggedCity) {
        this.draggedCity.x = x;
        this.draggedCity.y = y;
        this.redraw();
        return;
      }
      const hovered = this.cities.find((c) => c.containsPoint(x, y));
      const newHoverId = hovered?.id;
      if (newHoverId !== this.hoverCityId) {
        this.hoverCityId = newHoverId;
        this.redraw();
      }
    });

    canvas.addEventListener('mouseup', () => {
      if (this.draggedCity) {
        this.draggedCity = null;
        this.resetEngine();
      }
    });

    canvas.addEventListener('mouseleave', () => {
      this.draggedCity = null;
      this.hoverCityId = undefined;
      this.redraw();
    });

    this.getEl<HTMLButtonElement>('btn-start').onclick = () => {
      this.isRunning = true;
      this.worker.start();
    };

    this.getEl<HTMLButtonElement>('btn-stop').onclick = () => {
      this.isRunning = false;
      this.worker.stop();
    };

    this.getEl<HTMLButtonElement>('btn-reset').onclick = () => {
      this.worker.reset(this.cities);
      this.statsRenderer.clear();
      this.bestChromosome = [];
      this.redraw();
      this.updateDOMStats({
        generation: 0,
        bestDistance: 0,
        avgDistance: 0,
        worstDistance: 0,
        bestChromosome: [],
      });
    };

    this.getEl<HTMLButtonElement>('btn-new-demo').onclick = () => {
      this.isRunning = false;
      this.worker.stop();
      this.shuffleCityPositions();
      this.worker.reset(this.cities);
      this.statsRenderer.clear();
      this.bestChromosome = [];
      this.redraw();
    };

    const sliders: Array<{
      id: string;
      valId: string;
      key: keyof GAConfig;
      format: (v: number) => string;
    }> = [
      {
        id: 'pop-size',
        valId: 'val-pop',
        key: 'populationSize',
        format: (v) => String(v),
      },
      {
        id: 'mut-rate',
        valId: 'val-mut',
        key: 'mutationRate',
        format: (v) => v.toFixed(2),
      },
      {
        id: 'cross-rate',
        valId: 'val-cross',
        key: 'crossoverRate',
        format: (v) => v.toFixed(2),
      },
      {
        id: 'anim-speed',
        valId: 'val-speed',
        key: 'animationSpeed',
        format: (v) => String(v),
      },
    ];

    for (const { id, valId, key, format } of sliders) {
      const el = this.getEl<HTMLInputElement>(id);
      el.addEventListener('input', () => {
        const raw = el.type === 'range' && el.step.includes('.')
          ? parseFloat(el.value)
          : parseInt(el.value, 10);
        this.config = { ...this.config, [key]: raw };
        this.getEl(valId).textContent = format(raw);
        this.worker.updateConfig({ [key]: raw });
      });
    }
  }

  private resetEngine(): void {
    this.worker.reset(this.cities);
    this.statsRenderer.clear();
    this.bestChromosome = [];
    if (this.isRunning) this.worker.start();
  }

  private getCanvasCoords(e: MouseEvent): { x: number; y: number } {
    const rect = this.renderer.canvas.getBoundingClientRect();
    const scaleX = this.renderer.canvas.width / rect.width;
    const scaleY = this.renderer.canvas.height / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  }

  private updateDOMStats(stats: GenerationStats): void {
    this.getEl('stat-gen').textContent = String(stats.generation);
    this.getEl('stat-best').textContent =
      stats.bestDistance > 0 ? stats.bestDistance.toFixed(2) : '—';
    this.getEl('stat-avg').textContent =
      stats.avgDistance > 0 ? stats.avgDistance.toFixed(2) : '—';
  }

  private updateCityCount(): void {
    this.getEl('stat-cities').textContent = String(this.cities.length);
  }

  private getEl<T extends HTMLElement = HTMLElement>(id: string): T {
    return document.getElementById(id) as T;
  }
}
