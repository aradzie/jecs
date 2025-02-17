import { SingularMatrixError } from "./error.js";
import { vecCopy } from "./matrix.js";
import { type Sle } from "./sle.js";

/**
 * Solves `A * x = b` using the Gauss-Jordan elimination method.
 */
export function solveGaussJordan(sle: Sle): void {
  const { size, A, x, b } = sle;
  for (let k = 0; k < size; k++) {
    sle.findPivot(k);
    const p = A[k][k];
    if (p === 0) {
      throw new SingularMatrixError();
    }
    for (let j = k; j < size; j++) {
      A[k][j] /= p;
    }
    b[k] /= p;
    for (let i = 0; i < size; i++) {
      if (i !== k) {
        const t = A[i][k];
        for (let j = k; j < size; j++) {
          A[i][j] -= A[k][j] * t;
        }
        b[i] -= b[k] * t;
      }
    }
  }
  vecCopy(b, x);
}
