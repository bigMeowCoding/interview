import { Individual } from '../models/Individual';

/** 交换变异 */
export class Mutation {
  static swap(individual: Individual, rate: number): void {
    if (Math.random() > rate) return;
    const len = individual.chromosome.length;
    const i = Math.floor(Math.random() * len);
    const j = Math.floor(Math.random() * len);
    [individual.chromosome[i], individual.chromosome[j]] = [
      individual.chromosome[j],
      individual.chromosome[i],
    ];
  }
}
