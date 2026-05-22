import { describe, expect, it } from 'vitest';
import {
  isValidPermutation,
  orderCrossoverDeterministic,
} from './Crossover';

describe('Crossover.orderCrossover', () => {
  const cases = [
    {
      name: 'spec 示例 start=2 end=4',
      parentA: [0, 1, 2, 3, 4, 5],
      parentB: [0, 3, 5, 2, 1, 4],
      start: 2,
      end: 4,
      expected: [5, 1, 2, 3, 4, 0],
    },
    {
      name: '全段复制',
      parentA: [0, 1, 2, 3],
      parentB: [3, 2, 1, 0],
      start: 0,
      end: 3,
      expected: [0, 1, 2, 3],
    },
  ];

  it.each(cases)('$name', ({ parentA, parentB, start, end, expected }) => {
    const child = orderCrossoverDeterministic(parentA, parentB, start, end);
    expect(child).toEqual(expected);
    expect(isValidPermutation(child, parentA)).toBe(true);
  });

  it('随机 OX 100 次均产生合法排列', () => {
    const parentA = [0, 1, 2, 3, 4, 5, 6, 7];
    const parentB = [7, 6, 5, 4, 3, 2, 1, 0];
    for (let t = 0; t < 100; t++) {
      const start = Math.floor(Math.random() * parentA.length);
      const end = Math.floor(Math.random() * parentA.length);
      const s = Math.min(start, end);
      const e = Math.max(start, end);
      const child = orderCrossoverDeterministic(parentA, parentB, s, e);
      expect(isValidPermutation(child, parentA)).toBe(true);
    }
  });
});
