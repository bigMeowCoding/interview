import type { CityData, GAConfig, GenerationStats, WorkerMessage } from '../types';
import { City } from '../models/City';
import { Population } from '../models/Population';

let population: Population | null = null;
let config: GAConfig;
let running = false;

function toCities(data: CityData[]): City[] {
  return data.map((c) => new City(c.id, c.point.x, c.point.y));
}

self.onmessage = (e: MessageEvent<WorkerMessage>) => {
  const msg = e.data;

  switch (msg.type) {
    case 'INIT': {
      const cities = toCities(msg.payload.cities);
      config = msg.payload.config;
      population = new Population(cities, config);
      break;
    }
    case 'START':
      running = true;
      loop();
      break;
    case 'STOP':
      running = false;
      break;
    case 'RESET': {
      if (!population) return;
      const newCities = toCities(msg.payload.cities);
      population.reset(newCities);
      const stats = population.getStats();
      self.postMessage({ type: 'TICK', payload: stats } satisfies WorkerMessage);
      break;
    }
    case 'UPDATE_CONFIG': {
      if (!population || !config) return;
      config = { ...config, ...msg.payload };
      const currentCities = Array.from(population.cities.values());
      population = new Population(currentCities, config);
      const stats = population.getStats();
      self.postMessage({ type: 'TICK', payload: stats } satisfies WorkerMessage);
      break;
    }
  }
};

function loop(): void {
  if (!running || !population) return;

  const cityCount = population.cities.size;
  if (cityCount < 2) {
    running = false;
    return;
  }

  for (let i = 0; i < config.animationSpeed; i++) {
    population.evolve();
  }

  const stats: GenerationStats = population.getStats();
  self.postMessage({ type: 'TICK', payload: stats } satisfies WorkerMessage);

  if (stats.generation < config.maxGenerations) {
    requestAnimationFrame(loop);
  } else {
    running = false;
  }
}
