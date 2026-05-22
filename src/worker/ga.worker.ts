import { City } from '../models/City';
import { Population } from '../models/Population';
import type { CityData, GAConfig, GenerationStats, WorkerMessage } from '../types';

let population: Population | null = null;
let config: GAConfig | null = null;
let running = false;

self.onmessage = (e: MessageEvent<WorkerMessage>) => {
  const msg = e.data;

  switch (msg.type) {
    case 'INIT': {
      const cities = msg.payload.cities.map(
        (c: CityData) => new City(c.id, c.point.x, c.point.y),
      );
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
      const newCities = msg.payload.cities.map(
        (c: CityData) => new City(c.id, c.point.x, c.point.y),
      );
      population.reset(newCities);
      break;
    }

    case 'UPDATE_CONFIG': {
      if (!population || !config) return;
      config = { ...config, ...msg.payload };
      population.updateConfig(config);
      break;
    }
  }
};

function loop(): void {
  if (!running || !population || !config) return;

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

export {};
