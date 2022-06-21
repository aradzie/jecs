import { SingularMatrixError } from "./error.js";
import { vecCopy } from "./matrix.js";
import type { SLE } from "./sle.js";

/**
 * Solves `A * x = b` using the Gaussian elimination method.
 */
export function solveGauss(sle: SLE): void {
  const { size, A, x, b } = sle;
  for (let k = 0; k < size - 1; k++) {
    sle.findPivot(k);
    const p = A[k][k];
    if (p === 0) {
      throw new SingularMatrixError();
    }
    for (let i = k + 1; i < size; i++) {
      const t = A[i][k] / p;
      for (let j = k; j < size; j++) {
        A[i][j] -= A[k][j] * t;
      }
      b[i] -= b[k] * t;
    }
  }
  for (let k = size - 1; k >= 0; k--) {
    b[k] /= A[k][k];
    for (let i = k - 1; i >= 0; i--) {
      b[i] -= A[i][k] * b[k];
    }
  }
  vecCopy(b, x);
}
