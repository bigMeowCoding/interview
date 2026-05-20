import type { GAConfig } from '../types';
import { Crossover } from '../engine/Crossover';
import { Mutation } from '../engine/Mutation';
import { Selection } from '../engine/Selection';
import { City } from './City';
import { Individual } from './Individual';

/** 种群：初始化、进化、统计 */
export class Population {
  individuals: Individual[] = [];
  generation: number = 0;
  cities: Map<number, City>;
  private config: GAConfig;

  constructor(cities: City[], config: GAConfig) {
    this.cities = new Map(cities.map((c) => [c.id, c]));
    this.config = config;
    this.initialize();
  }

  initialize(): void {
    const cityIds = Array.from(this.cities.keys());
    this.individuals = [];
    if (cityIds.length === 0) {
      this.generation = 0;
      return;
    }
    for (let i = 0; i < this.config.populationSize; i++) {
      const shuffled = this.shuffle([...cityIds]);
      const ind = new Individual(shuffled);
      ind.calculateDistance(this.cities);
      this.individuals.push(ind);
    }
    this.sortByFitness();
  }

  evolve(): void {
    if (this.individuals.length === 0) return;

    const newPopulation: Individual[] = [];
    this.sortByFitness();

    const eliteCount = Math.min(this.config.elitismCount, this.individuals.length);
    for (let i = 0; i < eliteCount; i++) {
      newPopulation.push(this.individuals[i].clone());
    }

    while (newPopulation.length < this.config.populationSize) {
      const parentA = Selection.tournament(this.individuals, this.config.tournamentSize);
      const parentB = Selection.tournament(this.individuals, this.config.tournamentSize);

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
    if (this.individuals.length === 0) {
      return {
        generation: this.generation,
        bestDistance: 0,
        avgDistance: 0,
        worstDistance: 0,
        bestChromosome: [] as number[],
      };
    }
    const distances = this.individuals.map((ind) => ind.distance);
    return {
      generation: this.generation,
      bestDistance: this.individuals[0].distance,
      avgDistance: distances.reduce((a, b) => a + b, 0) / distances.length,
      worstDistance: distances[distances.length - 1],
      bestChromosome: [...this.individuals[0].chromosome],
    };
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

  reset(cities: City[]): void {
    this.cities = new Map(cities.map((c) => [c.id, c]));
    this.generation = 0;
    this.initialize();
  }
}
