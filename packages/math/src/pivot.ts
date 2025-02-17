import { type MatrixLike } from "./types.js";

export function findPartialPivot(A: MatrixLike, size: number, k: number): number {
  return findPivotRow(A, size, k, k);
}

/**
 * Scans the given column which starts at [i, j] and ends at [size, j],
 * returns index of the row with the largest value in the column.
 */
function findPivotRow(A: MatrixLike, size: number, i: number, j: number): number {
  let pivotRow = i;
  let pivotValue = Math.abs(A[i][j]);
  i++;
  while (i < size) {
    const v = Math.abs(A[i][j]);
    if (v > pivotValue) {
      pivotRow = i;
      pivotValue = v;
    }
    i++;
  }
  return pivotRow;
}

/**
 * Scans the given row which starts at [i, j] and ends at [i, size],
 * returns index of the column with the largest value in the row.
 */
function findPivotCol(A: MatrixLike, size: number, i: number, j: number): number {
  let pivotCol = j;
  let pivotValue = Math.abs(A[i][j]);
  j++;
  while (j < size) {
    const v = Math.abs(A[i][j]);
    if (v > pivotValue) {
      pivotCol = j;
      pivotValue = v;
    }
    j++;
  }
  return pivotCol;
}

/**
 * Returns the row and the column index of a pivot element which is found
 * using the rook pivot strategy.
 */
export function findRookPivot(
  A: MatrixLike,
  size: number,
  k: number,
): [rowIndex: number, colIndex: number] {
  let i = k;
  let j = k;
  let v = 0;
  let b = false;
  while (true) {
    const rowIndex = findPivotRow(A, size, k, j);
    const colMax = Math.abs(A[rowIndex][j]);
    if (colMax <= v && b) {
      break;
    }
    i = rowIndex;
    v = colMax;
    const colIndex = findPivotCol(A, size, i, k);
    const rowMax = Math.abs(A[i][colIndex]);
    if (rowMax <= v) {
      break;
    }
    j = colIndex;
    v = rowMax;
    b = true;
  }
  return [i, j];
}

export function findCompletePivot(
  A: MatrixLike,
  size: number,
  k: number,
): [rowIndex: number, colIndex: number] {
  let pivotRow = k;
  let pivotCol = k;
  let pivotValue = 0;
  for (let i = k; i < size; i++) {
    for (let j = k; j < size; j++) {
      const v = Math.abs(A[i][j]);
      if (v > pivotValue) {
        pivotRow = i;
        pivotCol = j;
        pivotValue = v;
      }
    }
  }
  return [pivotRow, pivotCol];
}

export function swap<T>(m: { [index: number]: T }, a: number, b: number): void {
  const t = m[a];
  m[a] = m[b];
  m[b] = t;
}
