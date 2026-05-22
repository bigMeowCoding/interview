import type { Individual } from '../models/Individual';

/** 锦标赛选择：随机抽 tournamentSize 个个体，取 fitness 最高者 */
export class Selection {
  static tournament(
    population: Individual[],
    tournamentSize: number,
  ) {
    var best = population[Math.floor(Math.random() * population.length)];
    for (let i = 1; i < tournamentSize; i++) {
      var contender =
        population[Math.floor(Math.random() * population.length)];
      if (contender.fitness > best.fitness) {
        best = contender;
      }
    }
    return best.clone();
  }
}
