import { assert } from "./assert.js";
import { matSize, swapRows } from "./matrix.js";
import { findPivotRow } from "./pivot.js";
import type { Matrix, Vector } from "./types.js";

/**
 * Solves `A * x = b` using the Gauss elimination method.
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
  const [h, w] = matSize(mat);
  const size = vec.length;

  assert(size === w && size === h);

  for (let k = 0; k < size - 1; k++) {
    pivot(mat, vec, size, k);

    for (let i = k + 1; i < size; i++) {
      const x = mat[i][k] / mat[k][k];
      for (let j = k; j < size; j++) {
        mat[i][j] -= mat[k][j] * x;
      }
      vec[i] -= vec[k] * x;
    }
  }

  for (let k = size - 1; k >= 0; k--) {
    vec[k] /= mat[k][k];
    for (let i = 0; i < k; i++) {
      vec[i] -= mat[i][k] * vec[k];
    }
  }
}

function pivot(matM: Matrix, vecM: Vector, size: number, k: number): void {
  const [_, pk] = findPivotRow(matM, size, k, k);
  if (pk !== k) {
    swapRows(matM, k, pk);
    swapRows(vecM, k, pk);
  }
}
