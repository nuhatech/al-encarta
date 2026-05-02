/**
 * Minesweeper game logic, pure functions only.
 * The Hormuz theme is purely visual; the gameplay is classic Minesweeper.
 */

export type CellState = {
  hasMine: boolean;
  revealed: boolean;
  flagged: boolean;
  adjacent: number; // 0-8
};

export type Board = CellState[][];

export type GameState = "ready" | "playing" | "won" | "lost";

export interface GameOptions {
  rows: number;
  cols: number;
  mines: number;
}

export const DEFAULT_OPTIONS: GameOptions = {
  rows: 10,
  cols: 12,
  // Demo difficulty: 8 mines on a 120-cell board (~7% density), easy enough
  // for the easter egg to actually be reachable in a few minutes.
  mines: 8,
};

export function emptyBoard(rows: number, cols: number): Board {
  return Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => ({
      hasMine: false,
      revealed: false,
      flagged: false,
      adjacent: 0,
    })),
  );
}

/**
 * Place mines randomly on a fresh board, avoiding the first-click cell and
 * its neighbours (so the player always opens a non-trivial area).
 */
export function placeMinesAvoiding(
  rows: number,
  cols: number,
  mines: number,
  safeRow: number,
  safeCol: number,
): Board {
  const board = emptyBoard(rows, cols);
  const safe = new Set<string>();
  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      const r = safeRow + dr;
      const c = safeCol + dc;
      if (r >= 0 && r < rows && c >= 0 && c < cols) safe.add(`${r}:${c}`);
    }
  }
  let placed = 0;
  while (placed < mines) {
    const r = Math.floor(Math.random() * rows);
    const c = Math.floor(Math.random() * cols);
    if (safe.has(`${r}:${c}`)) continue;
    if (board[r]![c]!.hasMine) continue;
    board[r]![c]!.hasMine = true;
    placed++;
  }
  // Compute adjacency counts
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (board[r]![c]!.hasMine) continue;
      let count = 0;
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          if (dr === 0 && dc === 0) continue;
          const nr = r + dr;
          const nc = c + dc;
          if (nr < 0 || nr >= rows || nc < 0 || nc >= cols) continue;
          if (board[nr]![nc]!.hasMine) count++;
        }
      }
      board[r]![c]!.adjacent = count;
    }
  }
  return board;
}

/**
 * Returns a new board with the cell at (row, col) revealed. If the cell has
 * 0 adjacent mines, recursively reveals its neighbours (flood fill).
 */
export function revealCell(board: Board, row: number, col: number): Board {
  const rows = board.length;
  const cols = board[0]!.length;
  const next = board.map((r) => r.map((c) => ({ ...c })));
  const stack: Array<[number, number]> = [[row, col]];
  while (stack.length > 0) {
    const top = stack.pop();
    if (!top) break;
    const [r, c] = top;
    const cell = next[r]?.[c];
    if (!cell || cell.revealed || cell.flagged) continue;
    cell.revealed = true;
    if (cell.hasMine) continue;
    if (cell.adjacent === 0) {
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          if (dr === 0 && dc === 0) continue;
          const nr = r + dr;
          const nc = c + dc;
          if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) {
            stack.push([nr, nc]);
          }
        }
      }
    }
  }
  return next;
}

export function toggleFlag(board: Board, row: number, col: number): Board {
  const next = board.map((r) => r.map((c) => ({ ...c })));
  const cell = next[row]?.[col];
  if (cell && !cell.revealed) cell.flagged = !cell.flagged;
  return next;
}

export function revealAllMines(board: Board): Board {
  return board.map((r) =>
    r.map((c) => (c.hasMine ? { ...c, revealed: true } : c)),
  );
}

export function isWon(board: Board): boolean {
  for (const row of board) {
    for (const cell of row) {
      if (!cell.hasMine && !cell.revealed) return false;
    }
  }
  return true;
}

export function countFlags(board: Board): number {
  let n = 0;
  for (const row of board) {
    for (const cell of row) {
      if (cell.flagged) n++;
    }
  }
  return n;
}
