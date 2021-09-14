/**
 * Scans the given column which starts at [i, j] and ends at [size, j],
 * returns index of the row with the largest value in the column.
 */
import type { MatrixLike } from "./types";

export function findPivotRow(
  mat: MatrixLike,
  size: number,
  i: number,
  j: number,
): [value: number, rowIndex: number] {
  let pivotRow = i;
  let pivotValue = Math.abs(mat[i][j]);
  i++;
  while (i < size) {
    const v = Math.abs(mat[i][j]);
    if (v > pivotValue) {
      pivotRow = i;
      pivotValue = v;
    }
    i++;
  }
  return [pivotValue, pivotRow];
}

/**
 * Scans the given row which starts at [i, j] and ends at [i, size],
 * returns index of the column with the largest value in the row.
 */
export function findPivotCol(
  mat: MatrixLike,
  size: number,
  i: number,
  j: number,
): [value: number, colIndex: number] {
  let pivotCol = j;
  let pivotValue = Math.abs(mat[i][j]);
  j++;
  while (j < size) {
    const v = Math.abs(mat[i][j]);
    if (v > pivotValue) {
      pivotCol = j;
      pivotValue = v;
    }
    j++;
  }
  return [pivotValue, pivotCol];
}

/**
 * Returns the row and the column index of a pivot element which is found
 * using the rook pivot strategy.
 */
export function findRookPivot(
  mat: MatrixLike,
  size: number,
  k: number,
): [rowIndex: number, colIndex: number] {
  let i = k;
  let j = k;
  let v = 0;
  let b = false;
  while (true) {
    const [colMax, rowIndex] = findPivotRow(mat, size, k, j);
    if (colMax <= v && b) {
      break;
    }
    i = rowIndex;
    v = colMax;
    const [rowMax, colIndex] = findPivotCol(mat, size, i, k);
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
  mat: MatrixLike,
  size: number,
  k: number,
): [rowIndex: number, colIndex: number] {
  let pivotRow = k;
  let pivotCol = k;
  let pivotValue = 0;
  for (let i = k; i < size; i++) {
    for (let j = k; j < size; j++) {
      const v = Math.abs(mat[pivotRow][pivotCol]);
      if (v > pivotValue) {
        pivotRow = i;
        pivotCol = j;
        pivotValue = v;
      }
    }
  }
  return [pivotRow, pivotCol];
}

export function swapRows<T>(
  m: { [index: number]: T },
  a: number,
  b: number,
): void {
  const t = m[a];
  m[a] = m[b];
  m[b] = t;
}

export function swapColumns<T>(
  m: ArrayLike<{ [index: number]: T }>,
  size: number,
  a: number,
  b: number,
): void {
  for (let i = 0; i < size; i++) {
    const row = m[i];
    const t = row[a];
    row[a] = row[b];
    row[b] = t;
  }
}
