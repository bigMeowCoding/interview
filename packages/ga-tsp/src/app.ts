import { DEFAULT_CONFIG } from './config';
import { GAWorkerProxy } from './GAWorkerProxy';
import { City } from './models/City';
import { CanvasRenderer } from './renderer/CanvasRenderer';
import { StatsRenderer } from './renderer/StatsRenderer';
import type { GAConfig, GenerationStats } from './types';

/** 应用主控制器：交互、渲染与 Worker 协调 */
export class App {
  private cities: City[] = [];
  private nextCityId = 0;
  private renderer: CanvasRenderer;
  private statsRenderer: StatsRenderer;
  private worker: GAWorkerProxy;
  private isRunning = false;
  private bestChromosome: number[] = [];
  private draggedCity: City | null = null;
  private configDebounceTimer: ReturnType<typeof setTimeout> | null = null;

  constructor() {
    this.renderer = new CanvasRenderer('main-canvas', 900, 650);
    this.statsRenderer = new StatsRenderer('stats-canvas', 260, 140);
    this.worker = new GAWorkerProxy((stats) => this.handleTick(stats));
    this.bindEvents();

    this.generateRandomCities(15);
    this.worker.init(this.cities, DEFAULT_CONFIG);
    this.drawScene();
  }

  private handleTick(stats: GenerationStats): void {
    this.bestChromosome = stats.bestChromosome;
    this.drawScene();
    this.statsRenderer.push(stats);
    this.updateDOMStats(stats);
  }

  private drawScene(): void {
    this.renderer.clear();
    this.renderer.drawCities(this.cities);
    if (this.bestChromosome.length >= 2 && this.cities.length >= 2) {
      this.renderer.drawPath(this.bestChromosome, this.cities);
    }
  }

  private randomPoint(): { x: number; y: number } {
    const padding = 50;
    return {
      x: padding + Math.random() * (this.renderer.width - padding * 2),
      y: padding + Math.random() * (this.renderer.height - padding * 2),
    };
  }

  private generateRandomCities(count: number): void {
    for (let i = 0; i < count; i++) {
      const { x, y } = this.randomPoint();
      this.cities.push(new City(this.nextCityId++, x, y));
    }
  }

  /** 保持城市数量与 id，随机重排坐标以开启新一轮演示 */
  private repositionCities(): void {
    this.cities.forEach((city) => {
      const { x, y } = this.randomPoint();
      city.x = x;
      city.y = y;
    });
  }

  private clearDemoStats(): void {
    this.bestChromosome = [];
    this.statsRenderer.clear();
    this.updateDOMStats({
      generation: 0,
      bestDistance: 0,
      avgDistance: 0,
      worstDistance: 0,
      bestChromosome: [],
    });
  }

  /** 新演示：暂停进化、重排城市位置、重置种群与统计 */
  private startNewDemo(): void {
    this.isRunning = false;
    this.worker.stop();
    this.draggedCity = null;

    const count = this.cities.length >= 2 ? this.cities.length : 15;
    if (this.cities.length >= 2) {
      this.repositionCities();
    } else {
      this.cities = [];
      this.nextCityId = 0;
      this.generateRandomCities(count);
    }

    this.worker.reset(this.cities);
    this.clearDemoStats();
    this.drawScene();
  }

  private bindEvents(): void {
    const canvas = this.renderer.canvas;

    canvas.addEventListener('mousedown', (e) => {
      const rect = canvas.getBoundingClientRect();
      const scaleX = this.renderer.width / rect.width;
      const scaleY = this.renderer.height / rect.height;
      const x = (e.clientX - rect.left) * scaleX;
      const y = (e.clientY - rect.top) * scaleY;

      const clicked = this.cities.find((c) => c.containsPoint(x, y));
      if (clicked) {
        this.draggedCity = clicked;
      } else {
        this.cities.push(new City(this.nextCityId++, x, y));
        this.resetEngine();
        this.drawScene();
      }
    });

    canvas.addEventListener('mousemove', (e) => {
      if (!this.draggedCity) return;
      const rect = canvas.getBoundingClientRect();
      const scaleX = this.renderer.width / rect.width;
      const scaleY = this.renderer.height / rect.height;
      this.draggedCity.x = (e.clientX - rect.left) * scaleX;
      this.draggedCity.y = (e.clientY - rect.top) * scaleY;
      this.resetEngine();
      this.drawScene();
    });

    canvas.addEventListener('mouseup', () => {
      this.draggedCity = null;
    });

    document.getElementById('btn-start')!.onclick = () => {
      if (this.cities.length < 2) return;
      this.isRunning = true;
      this.worker.start();
    };

    document.getElementById('btn-stop')!.onclick = () => {
      this.isRunning = false;
      this.worker.stop();
    };

    document.getElementById('btn-reset')!.onclick = () => {
      this.worker.reset(this.cities);
      this.clearDemoStats();
      this.drawScene();
    };

    document.getElementById('btn-new-demo')!.onclick = () => {
      this.startNewDemo();
    };

    const sliders = ['pop-size', 'mut-rate', 'anim-speed'];
    sliders.forEach((id) => {
      const el = document.getElementById(id) as HTMLInputElement;
      el.addEventListener('input', () => {
        if (this.configDebounceTimer) clearTimeout(this.configDebounceTimer);
        this.configDebounceTimer = setTimeout(() => {
          this.updateConfigFromDOM();
        }, 200);
      });
    });
  }

  private resetEngine(): void {
    this.worker.reset(this.cities);
    if (this.isRunning) this.worker.start();
  }

  private updateConfigFromDOM(): void {
    const config: Partial<GAConfig> = {
      populationSize: parseInt(
        (document.getElementById('pop-size') as HTMLInputElement).value,
        10,
      ),
      mutationRate: parseFloat(
        (document.getElementById('mut-rate') as HTMLInputElement).value,
      ),
      animationSpeed: parseInt(
        (document.getElementById('anim-speed') as HTMLInputElement).value,
        10,
      ),
    };
    this.worker.updateConfig(config);

    const popEl = document.getElementById('val-pop');
    const mutEl = document.getElementById('val-mut');
    const speedEl = document.getElementById('val-speed');
    if (popEl) popEl.textContent = String(config.populationSize);
    if (mutEl) mutEl.textContent = String(config.mutationRate);
    if (speedEl) speedEl.textContent = String(config.animationSpeed);
  }

  private updateDOMStats(stats: GenerationStats): void {
    const genEl = document.getElementById('stat-gen');
    const bestEl = document.getElementById('stat-best');
    const avgEl = document.getElementById('stat-avg');
    if (genEl) genEl.textContent = String(stats.generation);
    if (bestEl) {
      bestEl.textContent =
        stats.bestDistance > 0 ? stats.bestDistance.toFixed(2) : '-';
    }
    if (avgEl) {
      avgEl.textContent = stats.avgDistance > 0 ? stats.avgDistance.toFixed(2) : '-';
    }
  }
}
