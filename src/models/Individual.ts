import type { Chromosome } from '../types';
import type { City } from './City';

/** 个体：一条闭合路径 + 适应度 */
export class Individual {
  chromosome: Chromosome;
  distance = Infinity;
  fitness = 0;

  constructor(chromosome: Chromosome) {
    this.chromosome = chromosome;
  }

  /** 计算闭合路径总距离，并更新 fitness = 1 / (distance + ε) */
  calculateDistance(cities: Map<number, City>): number {
    let dist = 0;
    const len = this.chromosome.length;
    for (let i = 0; i < len; i++) {
      const from = cities.get(this.chromosome[i])!;
      const to = cities.get(this.chromosome[(i + 1) % len])!;
      dist += from.distanceTo(to);
    }
    this.distance = dist;
    this.fitness = 1 / (dist + 1e-6);
    return dist;
  }

  clone(): Individual {
    const ind = new Individual([...this.chromosome]);
    ind.distance = this.distance;
    ind.fitness = this.fitness;
    return ind;
  }
}
