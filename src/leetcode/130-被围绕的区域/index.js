// 给你一个 m x n 的矩阵 board ，由若干字符 'X' 和 'O' ，找到所有被 'X' 围绕的区域，并将这些区域里所有的 'O' 用 'X' 填充。
function solve(board) {
  if (board.length === 0) return;

  const m = board.length;
  const n = board[0].length;

  // 标记边界上的 'O' 及其相邻的 'O' 为特殊字符 '#'
  for (let i = 0; i < m; i++) {
    dfs(board, i, 0);
    dfs(board, i, n - 1);
  }

  for (let j = 0; j < n; j++) {
    dfs(board, 0, j);
    dfs(board, m - 1, j);
  }

  // 替换剩余的 'O' 为 'X'，将特殊字符 '#' 恢复为 'O'
  for (let i = 0; i < m; i++) {
    for (let j = 0; j < n; j++) {
      if (board[i][j] === "O") {
        board[i][j] = "X";
      } else if (board[i][j] === "#") {
        board[i][j] = "O";
      }
    }
  }
}

function dfs(board, i, j) {
  if (
    i < 0 ||
    i >= board.length ||
    j < 0 ||
    j >= board[0].length ||
    board[i][j] !== "O"
  ) {
    return;
  }

  board[i][j] = "#";

  dfs(board, i - 1, j);
  dfs(board, i + 1, j);
  dfs(board, i, j - 1);
  dfs(board, i, j + 1);
}
