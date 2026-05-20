import { Individual } from '../models/Individual';

/** Order Crossover (OX) 顺序交叉 */
export class Crossover {
  static orderCrossover(parentA: Individual, parentB: Individual): Individual {
    const len = parentA.chromosome.length;
    if (len <= 2) return parentA.clone();

    let start = Math.floor(Math.random() * len);
    let end = Math.floor(Math.random() * len);
    if (start > end) [start, end] = [end, start];

    const childChrom = new Array<number>(len).fill(-1);
    const segment = new Set(parentA.chromosome.slice(start, end + 1));
    for (let i = start; i <= end; i++) {
      childChrom[i] = parentA.chromosome[i];
    }

    let currentPos = (end + 1) % len;
    for (let i = 0; i < len; i++) {
      const bIndex = (end + 1 + i) % len;
      const city = parentB.chromosome[bIndex];
      if (!segment.has(city)) {
        childChrom[currentPos] = city;
        currentPos = (currentPos + 1) % len;
      }
    }

    return new Individual(childChrom);
  }
}
