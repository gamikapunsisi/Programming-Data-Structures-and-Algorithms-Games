/**
 * Unit tests for Eight Queens Puzzle Game
 */

describe('Eight Queens Puzzle - Threat Detection', () => {
  
  // Helper function to check if position is threatened
  function isThreatened(row, col, queens) {
    for (let i = 0; i < queens.length; i++) {
      const [qRow, qCol] = queens[i];
      
      // Check same row
      if (qRow === row) return true;
      
      // Check same column
      if (qCol === col) return true;
      
      // Check diagonals
      if (Math. abs(qRow - row) === Math.abs(qCol - col)) return true;
    }
    return false;
  }

  test('should detect threat in same row', () => {
    const queens = [[0, 0], [2, 3]];
    expect(isThreatened(0, 5, queens)).toBe(true);
  });

  test('should detect threat in same column', () => {
    const queens = [[0, 0], [2, 3]];
    expect(isThreatened(5, 0, queens)).toBe(true);
  });

  test('should detect threat on diagonal', () => {
    const queens = [[0, 0], [2, 3]];
    expect(isThreatened(1, 1, queens)).toBe(true); // Diagonal from (0,0)
    expect(isThreatened(3, 4, queens)).toBe(true); // Diagonal from (2,3)
  });

  test('should return false for safe position', () => {
    const queens = [[0, 0], [2, 1]];
    expect(isThreatened(4, 3, queens)).toBe(false);
  });

  test('should work with empty board', () => {
    const queens = [];
    expect(isThreatened(3, 3, queens)).toBe(false);
  });

  test('should work with multiple queens', () => {
    const queens = [[0, 0], [1, 2], [2, 4], [3, 6]];
    expect(isThreatened(4, 1, queens)).toBe(false);
    expect(isThreatened(4, 0, queens)).toBe(true); // Same column as (0,0)
  });
});

describe('Eight Queens Puzzle - Solution Validation', () => {
  
  function isValidSolution(queens) {
    if (queens.length !== 8) return false;
    
    for (let i = 0; i < queens.length; i++) {
      for (let j = i + 1; j < queens. length; j++) {
        const [r1, c1] = queens[i];
        const [r2, c2] = queens[j];
        
        // Check if queens threaten each other
        if (r1 === r2 || c1 === c2 || 
            Math.abs(r1 - r2) === Math.abs(c1 - c2)) {
          return false;
        }
      }
    }
    return true;
  }

  test('should validate correct solution', () => {
    const validSolution = [[0,0], [1,4], [2,7], [3,5], [4,2], [5,6], [6,1], [7,3]];
    expect(isValidSolution(validSolution)).toBe(true);
  });

  test('should reject solution with less than 8 queens', () => {
    const invalidSolution = [[0,0], [1,4], [2,7]];
    expect(isValidSolution(invalidSolution)).toBe(false);
  });

  test('should reject solution with queens in same row', () => {
    const invalidSolution = [[0,0], [0,4], [2,7], [3,5], [4,2], [5,6], [6,1], [7,3]];
    expect(isValidSolution(invalidSolution)).toBe(false);
  });

  test('should reject solution with queens in same column', () => {
    const invalidSolution = [[0,0], [1,0], [2,7], [3,5], [4,2], [5,6], [6,1], [7,3]];
    expect(isValidSolution(invalidSolution)).toBe(false);
  });

  test('should reject solution with queens on same diagonal', () => {
    const invalidSolution = [[0,0], [1,1], [2,7], [3,5], [4,2], [5,6], [6,1], [7,3]];
    expect(isValidSolution(invalidSolution)).toBe(false);
  });
});

describe('Eight Queens Puzzle - Solution Finder', () => {
  
  function solveNQueens() {
    const solutions = [];
    const board = Array(8).fill(-1);

    function isSafe(row, col) {
      for (let i = 0; i < row; i++) {
        if (board[i] === col || 
            Math.abs(board[i] - col) === Math.abs(i - row)) {
          return false;
        }
      }
      return true;
    }

    function solve(row) {
      if (row === 8) {
        const solution = [];
        for (let i = 0; i < 8; i++) {
          solution. push([i, board[i]]);
        }
        solutions. push(solution);
        return;
      }

      for (let col = 0; col < 8; col++) {
        if (isSafe(row, col)) {
          board[row] = col;
          solve(row + 1);
          board[row] = -1;
        }
      }
    }

    solve(0);
    return solutions;
  }

  test('should find exactly 92 solutions', () => {
    const solutions = solveNQueens();
    expect(solutions. length).toBe(92);
  });

  test('all solutions should be valid', () => {
    const solutions = solveNQueens();
    
    function isValidSolution(queens) {
      if (queens.length !== 8) return false;
      
      for (let i = 0; i < queens.length; i++) {
        for (let j = i + 1; j < queens.length; j++) {
          const [r1, c1] = queens[i];
          const [r2, c2] = queens[j];
          
          if (r1 === r2 || c1 === c2 || 
              Math.abs(r1 - r2) === Math.abs(c1 - c2)) {
            return false;
          }
        }
      }
      return true;
    }
    
    solutions.forEach(solution => {
      expect(isValidSolution(solution)).toBe(true);
    });
  });

  test('all solutions should be unique', () => {
    const solutions = solveNQueens();
    const serialized = solutions.map(s => JSON.stringify(s));
    const unique = new Set(serialized);
    expect(unique.size).toBe(solutions.length);
  });
});