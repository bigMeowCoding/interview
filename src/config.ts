import type { GAConfig } from './types';

/** 默认算法参数 */
export const DEFAULT_CONFIG: GAConfig = {
  populationSize: 100,
  mutationRate: 0.02,
  crossoverRate: 0.9,
  elitismCount: 2,
  tournamentSize: 5,
  maxGenerations: 100_000, // Spec 推荐 10000，此处提高上限便于观察长期收敛
  animationSpeed: 1,
};
