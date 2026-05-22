import { describe, expect, it } from 'vitest';
import { DEFAULT_CONFIG } from '../config';
import { isValidPermutation } from '../engine/Crossover';
import { City } from './City';
import { Population } from './Population';

function makeSquareCities(): City[] {
  return [
    new City(0, 0, 0),
    new City(1, 100, 0),
    new City(2, 100, 100),
    new City(3, 0, 100),
  ];
}

describe('Population', () => {
  it('初始化种群大小与配置一致', () => {
    const config = { ...DEFAULT_CONFIG, populationSize: 50 };
    const pop = new Population(makeSquareCities(), config);
    expect(pop.individuals).toHaveLength(50);
  });

  it('每个个体染色体为合法排列', () => {
    const cities = makeSquareCities();
    const cityIds = cities.map((c) => c.id);
    const pop = new Population(cities, DEFAULT_CONFIG);
    for (const ind of pop.individuals) {
      expect(isValidPermutation(ind.chromosome, cityIds)).toBe(true);
    }
  });

  it('进化后最优距离不劣于初始', () => {
    const cities = makeSquareCities();
    const pop = new Population(cities, {
      ...DEFAULT_CONFIG,
      populationSize: 80,
      mutationRate: 0.05,
    });
    const initialBest = pop.getBest().distance;

    for (let i = 0; i < 200; i++) {
      pop.evolve();
    }

    expect(pop.getBest().distance).toBeLessThanOrEqual(initialBest);
    expect(pop.generation).toBe(200);
  });

  it('正方形四城最优闭合路径约为 400', () => {
    const cities = makeSquareCities();
    const pop = new Population(cities, {
      ...DEFAULT_CONFIG,
      populationSize: 200,
      mutationRate: 0.03,
      tournamentSize: 8,
    });

    for (let i = 0; i < 500; i++) {
      pop.evolve();
    }

    // 最优回路 0→1→2→3→0 = 400
    expect(pop.getBest().distance).toBeLessThan(420);
  });
});
