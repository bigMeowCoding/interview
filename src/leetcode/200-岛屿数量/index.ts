export function numIslands(grid: string[][]): number {
  const visited = [];
  const steps = [
    { i: 1, j: 0 },
    { i: -1, j: 0 },
    { i: 0, j: 1 },
    { i: 0, j: -1 },
  ];
  for (let i = 0; i < grid.length; i++) {
    visited.push(new Array(grid[i].length));
  }
  function pointIsInRegion(i, j) {
    return i >= 0 && j >= 0 && i < grid.length && j < grid[i].length;
  }
  function dfs(i, j) {
    visited[i][j] = true;
    for (let step of steps) {
      const newI = i + step.i;
      const newJ = j + step.j;
      if (
        pointIsInRegion(newI, newJ) &&
        visited[newI][newJ] !== true &&
        grid[newI][newJ] === "1"
      ) {
        dfs(newI, newJ);
      }
    }
  }
  let count = 0;

  for (let i = 0; i < grid.length; i++) {
    for (let j = 0; j < grid[i].length; j++) {
      if (grid[i][j] === "1" && visited[i][j] !== true) {
        count++;
        dfs(i, j);
      }
    }
  }
  return count;
}
