import type { City } from './models/City';
import type { CityData, GAConfig, GenerationStats } from './types';

/** 主线程与 GA Worker 的通信封装 */
export class GAWorkerProxy {
  private worker: Worker;
  private onTick: (stats: GenerationStats) => void;

  constructor(onTick: (stats: GenerationStats) => void) {
    this.onTick = onTick;
    this.worker = new Worker(new URL('./worker/ga.worker.ts', import.meta.url), {
      type: 'module',
    });
    this.worker.onmessage = (e: MessageEvent<{ type: string; payload?: GenerationStats }>) => {
      if (e.data.type === 'TICK' && e.data.payload) {
        this.onTick(e.data.payload);
      }
    };
  }

  private toCityData(cities: City[]): CityData[] {
    return cities.map((c) => ({ id: c.id, point: { x: c.x, y: c.y } }));
  }

  init(cities: City[], config: GAConfig): void {
    this.worker.postMessage({
      type: 'INIT',
      payload: { cities: this.toCityData(cities), config },
    });
  }

  start(): void {
    this.worker.postMessage({ type: 'START' });
  }

  stop(): void {
    this.worker.postMessage({ type: 'STOP' });
  }

  reset(cities: City[]): void {
    this.worker.postMessage({
      type: 'RESET',
      payload: { cities: this.toCityData(cities) },
    });
  }

  updateConfig(config: Partial<GAConfig>): void {
    this.worker.postMessage({ type: 'UPDATE_CONFIG', payload: config });
  }

  terminate(): void {
    this.worker.terminate();
  }
}
