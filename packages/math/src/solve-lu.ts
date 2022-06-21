import { SingularMatrixError } from "./error.js";
import { vecCopy } from "./matrix.js";
import { findPartialPivot, swap } from "./pivot.js";
import type { SLE } from "./sle.js";
import type { Matrix, PermVector } from "./types.js";

/**
 * Solves `A * x = b` using the LU decomposition method.
 */
export function factorLu(sle: SLE): void {
  const { size, A, perm } = sle;
  for (let k = 0; k < size; k++) {
    findPivot(A, perm, size, k);
    const p = A[k][k];
    if (p === 0) {
      throw new SingularMatrixError();
    }
    for (let j = k + 1; j < size; j++) {
      A[k][j] /= p;
    }
    for (let i = k + 1; i < size; i++) {
      for (let j = k + 1; j < size; j++) {
        A[i][j] -= A[i][k] * A[k][j];
      }
    }
  }
}

export function solveLu(sle: SLE): void {
  const { size, A, x, b, perm } = sle;
  for (let k = 0; k < size; k++) {
    let sum = 0;
    for (let j = 0; j < k; j++) {
      sum += A[k][j] * x[j];
    }
    x[k] = (b[perm[k]] - sum) / A[k][k];
  }
  for (let k = size - 1; k >= 0; k--) {
    let sum = 0;
    for (let j = k + 1; j < size; j++) {
      sum += A[k][j] * b[j];
    }
    b[k] = x[k] - sum;
  }
  vecCopy(b, x);
}

function findPivot(A: Matrix, perm: PermVector, size: number, k: number): void {
  const pivotRow = findPartialPivot(A, size, k);
  if (pivotRow !== k) {
    swap(A, k, pivotRow);
    swap(perm, k, pivotRow);
  }
}
