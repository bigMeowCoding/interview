import type { City } from '../models/City';
import { Population } from '../models/Population';
import type { GAConfig, GenerationStats } from '../types';

/** 主线程备用 GA 引擎（与 Worker 逻辑等价） */
export class GAEngine {
  population: Population;
  config: GAConfig;
  isRunning = false;
  private animationId: number | null = null;
  private onTick: (stats: GenerationStats) => void;

  constructor(
    cities: City[],
    config: GAConfig,
    onTick: (stats: GenerationStats) => void,
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
    this.population.updateConfig(this.config);
  }

  updateCities(cities: City[]): void {
    this.population.reset(cities);
  }
}
