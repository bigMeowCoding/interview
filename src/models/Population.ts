import { Crossover } from '../engine/Crossover';
import { Mutation } from '../engine/Mutation';
import { Selection } from '../engine/Selection';
import type { GAConfig } from '../types';
import type { City } from './City';
import { Individual } from './Individual';

/** 种群：维护一代个体并执行 evolve */
export class Population {
  individuals: Individual[] = [];
  generation = 0;
  cities: Map<number, City>;
  private config: GAConfig;

  constructor(cities: City[], config: GAConfig) {
    this.cities = new Map(cities.map((c) => [c.id, c]));
    this.config = config;
    this.initialize();
  }

  /** 随机打乱城市 id 生成初始种群 */
  initialize(): void {
    const cityIds = Array.from(this.cities.keys());
    this.individuals = [];
    for (let i = 0; i < this.config.populationSize; i++) {
      const shuffled = this.shuffle([...cityIds]);
      const ind = new Individual(shuffled);
      ind.calculateDistance(this.cities);
      this.individuals.push(ind);
    }
    this.sortByFitness();
  }

  /** 执行一代进化：精英保留 + 锦标赛选择 + OX 交叉 + swap 变异 */
  evolve(): void {
    const newPopulation: Individual[] = [];
    this.sortByFitness();

    for (let i = 0; i < this.config.elitismCount; i++) {
      newPopulation.push(this.individuals[i].clone());
    }

    while (newPopulation.length < this.config.populationSize) {
      const parentA = Selection.tournament(
        this.individuals,
        this.config.tournamentSize,
      );
      const parentB = Selection.tournament(
        this.individuals,
        this.config.tournamentSize,
      );

      let child: Individual;
      if (Math.random() < this.config.crossoverRate) {
        child = Crossover.orderCrossover(parentA, parentB);
      } else {
        child = parentA.clone();
      }

      Mutation.swap(child, this.config.mutationRate);
      child.calculateDistance(this.cities);
      newPopulation.push(child);
    }

    this.individuals = newPopulation;
    this.generation++;
    this.sortByFitness();
  }

  getBest(): Individual {
    return this.individuals[0];
  }

  getStats() {
    const distances = this.individuals.map((ind) => ind.distance);
    return {
      generation: this.generation,
      bestDistance: this.individuals[0].distance,
      avgDistance: distances.reduce((a, b) => a + b, 0) / distances.length,
      worstDistance: distances[distances.length - 1],
      bestChromosome: [...this.individuals[0].chromosome],
    };
  }

  /** 城市坐标变化时重置种群 */
  reset(cities: City[]): void {
    this.cities = new Map(cities.map((c) => [c.id, c]));
    this.generation = 0;
    this.initialize();
  }

  /** 更新配置并重建种群 */
  updateConfig(config: GAConfig): void {
    this.config = config;
    const currentCities = Array.from(this.cities.values());
    this.cities = new Map(currentCities.map((c) => [c.id, c]));
    this.generation = 0;
    this.initialize();
  }

  private sortByFitness(): void {
    this.individuals.sort((a, b) => b.fitness - a.fitness);
  }

  private shuffle<T>(arr: T[]): T[] {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }
}
