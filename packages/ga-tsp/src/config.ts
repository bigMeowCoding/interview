import type { GAConfig } from './types';

/** 默认遗传算法参数 */
export const DEFAULT_CONFIG: GAConfig = {
  populationSize: 100,
  mutationRate: 0.02,
  crossoverRate: 0.9,
  elitismCount: 2,
  tournamentSize: 5,
  maxGenerations: 100000,
  animationSpeed: 1,
};
