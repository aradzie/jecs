import { SingularMatrixError } from "./error.js";
import { swapRows } from "./matrix.js";
import { findPivotRow } from "./pivot.js";
import type { Matrix, Vector } from "./types.js";

/**
 * Solves `A * x = b` using the Gauss-Jordan elimination method.
 *
 * The solution will be computed in place, and the content of both matrix `A`
 * and vector `b` will be overwritten, so make sure to make copies if you need
 * the original content.
 *
 * @param mat A matrix `A`.
 * @param vec A vector which is `b` before the call and is updated to contain
 * the values of `x` after the call.
 */
export function solve(mat: Matrix, vec: Vector): void {
  const size = vec.length;
  for (let k = 0; k < size; k++) {
    findPivot(mat, vec, size, k);
    const p = mat[k][k];
    if (p === 0) {
      throw new SingularMatrixError();
    }
    for (let j = k; j < size; j++) {
      mat[k][j] /= p;
    }
    vec[k] /= p;
    for (let i = 0; i < size; i++) {
      if (i !== k) {
        const y = mat[i][k];
        for (let j = k; j < size; j++) {
          mat[i][j] -= mat[k][j] * y;
        }
        vec[i] -= vec[k] * y;
      }
    }
  }
}

function findPivot(matM: Matrix, vecM: Vector, size: number, k: number): void {
  const [_, pk] = findPivotRow(matM, size, k, k);
  if (pk !== k) {
    swapRows(matM, k, pk);
    swapRows(vecM, k, pk);
  }
}
