import type { Individual } from '../models/Individual';
import { Individual as IndividualClass } from '../models/Individual';

/** 顺序交叉 OX：保证子代染色体仍为合法排列 */
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

    return new IndividualClass(childChrom);
  }
}

/** 确定性 OX（供测试使用） */
export function orderCrossoverDeterministic(
  parentA: number[],
  parentB: number[],
  start: number,
  end: number,
): number[] {
  const len = parentA.length;
  const childChrom = new Array<number>(len).fill(-1);
  const segment = new Set(parentA.slice(start, end + 1));
  for (let i = start; i <= end; i++) {
    childChrom[i] = parentA[i];
  }

  let currentPos = (end + 1) % len;
  for (let i = 0; i < len; i++) {
    const bIndex = (end + 1 + i) % len;
    const city = parentB[bIndex];
    if (!segment.has(city)) {
      childChrom[currentPos] = city;
      currentPos = (currentPos + 1) % len;
    }
  }
  return childChrom;
}

/** 验证染色体是否为合法排列（无重复、无遗漏） */
export function isValidPermutation(chrom: number[], cityIds: number[]): boolean {
  if (chrom.length !== cityIds.length) return false;
  const sorted = [...chrom].sort((a, b) => a - b);
  const expected = [...cityIds].sort((a, b) => a - b);
  return sorted.every((v, i) => v === expected[i]);
}
