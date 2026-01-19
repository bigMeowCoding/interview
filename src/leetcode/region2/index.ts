/**
 Do not return anything, modify board in-place instead.
 */
function solve(board: string[][]): void {
  const pos = {
    x: "X",
    o: "O",
  };
  const steps = [
    {
      i: -1,
      j: 0,
    },
    {
      i: 1,
      j: 0,
    },
    {
      i: 0,
      j: -1,
    },
    {
      i: 0,
      j: 1,
    },
  ];
  let cached = new Array(board.length).fill([]);
  cached = cached.map(() => {
    return new Array(board[0].length).fill(false);
  });

  function isBoaderPos(i, j) {
    return (
      i === 0 || j == 0 || i === board.length - 1 || j === board[0].length - 1
    );
  }
  //  function isRightPos(i,j) {
  //     const m=board.length,n=board[0].length ;
  //     return i>=0&&j>=0&&i<m&&j<n;
  // }


  function track(i,j) {
    let trackResult =true;
    for(let step of steps) {
      const newI= i+step.i;
      const newY=j+step.j;
      if(board[newI][newY] ===pos.o && !cached[newI][newY]) {
        if(isBoaderPos(newI,newY)) {
          trackResult= false
        }  else {
          cached[i][j]=true
          const reult= track(newI,newY)
          cached[i][j]=false;

          trackResult =trackResult && reult
        }
      }

    }
    if(trackResult) {
      board[i][j]=pos.x
    }
    return trackResult
  }

  for (let i = 0; i < board.length; i++) {
    for (let j = 0; j < board[i].length; j++) {
      if (!isBoaderPos(i, j) && board[i][j] === pos.o) {
        const result = track(i, j);
        if (result) {
          board[i][j] = pos.x;
        }
      }
    }
  }
}
const result= solve([
  ["O", "X", "X", "O", "X"],
  ["X", "O", "O", "X", "O"],
  ["X", "O", "X", "O", "X"],
  ["O", "X", "O", "O", "O"],
  ["X", "X", "O", "X", "O"],
]);

console.log(result)
