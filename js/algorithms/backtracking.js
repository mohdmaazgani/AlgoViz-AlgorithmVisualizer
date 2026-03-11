/* ═══════════════════════════════════════════
   algorithms/backtracking.js
   N-Queens, TSP, Sudoku Solver
   ═══════════════════════════════════════════ */

/* ═══════════════ N-QUEENS ═══════════════ */
/**
 * N-Queens generator — yields steps with board state
 */
function* nQueensGen(n) {
  const board = Array.from({ length: n }, () => Array(n).fill(0));

  function isSafe(row, col) {
    for (let r = 0; r < row; r++) {
      for (let c = 0; c < n; c++) {
        if (board[r][c] === 1) {
          if (c === col || Math.abs(r - row) === Math.abs(c - col))
            return false;
        }
      }
    }
    return true;
  }

  function* solve(row) {
    if (row === n) {
      yield {
        type: "solution",
        board: board.map((r) => [...r]),
        message: `Solution found!`,
      };
      return true;
    }
    for (let col = 0; col < n; col++) {
      yield {
        type: "try",
        row,
        col,
        board: board.map((r) => [...r]),
        message: `Trying queen at (${row},${col})`,
      };
      if (isSafe(row, col)) {
        board[row][col] = 1;
        yield {
          type: "place",
          row,
          col,
          board: board.map((r) => [...r]),
          message: `Placed queen at (${row},${col})`,
        };
        const result = yield* solve(row + 1);
        if (result) return true;
        board[row][col] = 0;
        yield {
          type: "remove",
          row,
          col,
          board: board.map((r) => [...r]),
          message: `Backtrack: remove queen from (${row},${col})`,
        };
      } else {
        yield {
          type: "conflict",
          row,
          col,
          board: board.map((r) => [...r]),
          message: `Conflict at (${row},${col}), skip`,
        };
      }
    }
    return false;
  }

  yield* solve(0);
  yield {
    type: "done",
    board: board.map((r) => [...r]),
    message: "N-Queens complete!",
  };
}

/* ═══════════════ TSP ═══════════════ */
/**
 * TSP with backtracking + pruning
 */
function* tspGen(cities) {
  const n = cities.length;
  const visited = new Array(n).fill(false);
  let bestCost = Infinity;
  let bestPath = [];

  function dist(a, b) {
    return Math.hypot(cities[a].x - cities[b].x, cities[a].y - cities[b].y);
  }

  function* solve(path, curCost) {
    if (path.length === n) {
      const total = curCost + dist(path[path.length - 1], path[0]);
      yield {
        type: "complete",
        path: [...path],
        cost: total,
        message: `Complete tour: cost=${total.toFixed(1)}`,
      };
      if (total < bestCost) {
        bestCost = total;
        bestPath = [...path];
        yield {
          type: "best",
          path: [...bestPath],
          cost: bestCost,
          message: `New best: ${bestCost.toFixed(1)}`,
        };
      }
      return;
    }
    for (let next = 0; next < n; next++) {
      if (!visited[next]) {
        const step = dist(path[path.length - 1], next);
        if (curCost + step < bestCost) {
          // prune
          visited[next] = true;
          path.push(next);
          yield {
            type: "visit",
            path: [...path],
            message: `Visit city ${next} (cost so far: ${(curCost + step).toFixed(1)})`,
          };
          yield* solve(path, curCost + step);
          path.pop();
          visited[next] = false;
          yield {
            type: "backtrack",
            path: [...path],
            message: `Backtrack from city ${next}`,
          };
        } else {
          yield {
            type: "prune",
            path: [...path],
            message: `Prune: path to ${next} exceeds best ${bestCost.toFixed(1)}`,
          };
        }
      }
    }
  }

  visited[0] = true;
  yield* solve([0], 0);
  yield {
    type: "done",
    path: bestPath,
    cost: bestCost,
    message: `TSP complete! Best cost: ${bestCost.toFixed(1)}`,
  };
}

/* ═══════════════ SUDOKU ═══════════════ */
/**
 * Sudoku solver generator
 * board = 9x9 array (0 = empty)
 */
function* sudokuGen(initialBoard) {
  const board = initialBoard.map((r) => [...r]);

  function isValid(row, col, num) {
    // Row check
    for (let c = 0; c < 9; c++) if (board[row][c] === num) return false;
    // Col check
    for (let r = 0; r < 9; r++) if (board[r][col] === num) return false;
    // Box check
    const br = Math.floor(row / 3) * 3,
      bc = Math.floor(col / 3) * 3;
    for (let r = br; r < br + 3; r++)
      for (let c = bc; c < bc + 3; c++) if (board[r][c] === num) return false;
    return true;
  }

  function findEmpty() {
    for (let r = 0; r < 9; r++)
      for (let c = 0; c < 9; c++) if (board[r][c] === 0) return [r, c];
    return null;
  }

  function* solve() {
    const cell = findEmpty();
    if (!cell) {
      yield {
        type: "solved",
        board: board.map((r) => [...r]),
        message: "Sudoku solved!",
      };
      return true;
    }
    const [row, col] = cell;
    for (let num = 1; num <= 9; num++) {
      yield {
        type: "try",
        row,
        col,
        num,
        board: board.map((r) => [...r]),
        message: `Try ${num} at (${row},${col})`,
      };
      if (isValid(row, col, num)) {
        board[row][col] = num;
        yield {
          type: "place",
          row,
          col,
          num,
          board: board.map((r) => [...r]),
          message: `Place ${num} at (${row},${col})`,
        };
        const result = yield* solve();
        if (result) return true;
        board[row][col] = 0;
        yield {
          type: "remove",
          row,
          col,
          board: board.map((r) => [...r]),
          message: `Backtrack: remove from (${row},${col})`,
        };
      } else {
        yield {
          type: "invalid",
          row,
          col,
          num,
          message: `${num} invalid at (${row},${col})`,
        };
      }
    }
    return false;
  }

  yield {
    type: "start",
    board: board.map((r) => [...r]),
    message: "Starting Sudoku solver...",
  };
  yield* solve();
}

/* ── Sample Sudoku puzzle ── */
const SAMPLE_SUDOKU = [
  [5, 3, 0, 0, 7, 0, 0, 0, 0],
  [6, 0, 0, 1, 9, 5, 0, 0, 0],
  [0, 9, 8, 0, 0, 0, 0, 6, 0],
  [8, 0, 0, 0, 6, 0, 0, 0, 3],
  [4, 0, 0, 8, 0, 3, 0, 0, 1],
  [7, 0, 0, 0, 2, 0, 0, 0, 6],
  [0, 6, 0, 0, 0, 0, 2, 8, 0],
  [0, 0, 0, 4, 1, 9, 0, 0, 5],
  [0, 0, 0, 0, 8, 0, 0, 7, 9],
];

const BACKTRACK_ALGORITHMS = {
  nQueens: { gen: nQueensGen, label: "N-Queens", theory: "nQueens" },
  tsp: { gen: tspGen, label: "TSP", theory: "tsp" },
  sudoku: { gen: sudokuGen, label: "Sudoku", theory: "sudoku" },
};
