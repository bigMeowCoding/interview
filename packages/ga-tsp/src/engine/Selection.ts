import { Individual } from '../models/Individual';

/** 锦标赛选择 */
export class Selection {
  static tournament(population: Individual[], tournamentSize: number): Individual {
    let best = population[Math.floor(Math.random() * population.length)];
    for (let i = 1; i < tournamentSize; i++) {
      const contender = population[Math.floor(Math.random() * population.length)];
      if (contender.fitness > best.fitness) {
        best = contender;
      }
    }
    return best.clone();
  }
}
