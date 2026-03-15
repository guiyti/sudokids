export type Board = (number | null)[][];

function isValid(board: Board, row: number, col: number, num: number): boolean {
  for (let i = 0; i < 9; i++) {
    if (board[row][i] === num) return false;
    if (board[i][col] === num) return false;
  }
  const startRow = Math.floor(row / 3) * 3;
  const startCol = Math.floor(col / 3) * 3;
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      if (board[startRow + i][startCol + j] === num) return false;
    }
  }
  return true;
}

function solve(board: Board): boolean {
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      if (board[row][col] === null) {
        const nums = [1, 2, 3, 4, 5, 6, 7, 8, 9].sort(() => Math.random() - 0.5);
        for (const num of nums) {
          if (isValid(board, row, col, num)) {
            board[row][col] = num;
            if (solve(board)) return true;
            board[row][col] = null;
          }
        }
        return false;
      }
    }
  }
  return true;
}

export function generateSudoku(difficulty: 'very_easy' | 'easy' | 'medium' | 'hard'): { puzzle: Board, solution: Board } {
  const board: Board = Array(9).fill(null).map(() => Array(9).fill(null));
  
  // Fill diagonal 3x3 blocks first to speed up generation
  for (let i = 0; i < 9; i = i + 3) {
      const nums = [1, 2, 3, 4, 5, 6, 7, 8, 9].sort(() => Math.random() - 0.5);
      let idx = 0;
      for (let r = 0; r < 3; r++) {
          for (let c = 0; c < 3; c++) {
              board[i + r][i + c] = nums[idx++];
          }
      }
  }
  
  solve(board);
  
  const solution = board.map(row => [...row]);
  const puzzle = board.map(row => [...row]);
  
  let cellsToRemove = 20;
  if (difficulty === 'easy') cellsToRemove = 35;
  if (difficulty === 'medium') cellsToRemove = 45;
  if (difficulty === 'hard') cellsToRemove = 55;
  
  let removed = 0;
  while (removed < cellsToRemove) {
    const row = Math.floor(Math.random() * 9);
    const col = Math.floor(Math.random() * 9);
    if (puzzle[row][col] !== null) {
      puzzle[row][col] = null;
      removed++;
    }
  }
  
  return { puzzle, solution };
}
