export function coinChange(coins: number[], amount: number): number {
  const cache = [0];
  for (let i = 1; i <= amount; i++) {
    let cost = -1;

    for (let coin of coins) {
      let compute;
      let remain = i - coin;
      if (remain >= 0 && cache[remain] != -1) {
        compute = 1 + cache[remain];
      } else {
        compute = -1;
      }

      if (compute !== -1 && cost !== -1) {
        cost = Math.min(cost, compute);
      } else if (compute !== -1) {
        cost = compute;
      }
    }
    cache[i] = cost;
  }
  return cache[amount];
}
