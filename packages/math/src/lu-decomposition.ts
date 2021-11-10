import { assert } from "./assert";
import { matSize, swapRows } from "./matrix";
import { findPivotRow, PermVector } from "./pivot";
import type { Matrix, Solver, Vector } from "./types";

/**
 * Creates a new solver which uses LU decomposition to find a solution
 * to equation `A * x = b`.
 * @param mat A matrix `A`.
 */
export function createSolver(mat: Matrix): Solver {
  const [size, w] = matSize(mat);

  assert(size === w);

  const p = new Int32Array(size);
  for (let i = 0; i < size; i++) {
    p[i] = i;
  }

  for (let k = 0; k < size; k++) {
    pivot(mat, p, size, k);

    for (let j = k + 1; j < size; j++) {
      mat[k][j] /= mat[k][k];
    }

    for (let i = k + 1; i < size; i++) {
      for (let j = k + 1; j < size; j++) {
        mat[i][j] -= mat[i][k] * mat[k][j];
      }
    }
  }

  const y = new Float64Array(size);

  return function solver(vec: Vector): void {
    assert(size === vec.length);

    // LUx = b, Ly = b, Ux = y

    // Use forward substitution to compute y.
    for (let k = 0; k < size; k++) {
      let sum = 0;
      for (let j = 0; j < k; j++) {
        sum += mat[k][j] * y[j];
      }
      y[k] = (vec[p[k]] - sum) / mat[k][k];
    }

    // Use backward substitution to compute x.
    for (let k = size - 1; k >= 0; k--) {
      let sum = 0;
      for (let j = k + 1; j < size; j++) {
        sum += mat[k][j] * vec[j];
      }
      vec[k] = y[k] - sum;
    }
  };
}

function pivot(matM: Matrix, p: PermVector, size: number, k: number): void {
  const [_, pk] = findPivotRow(matM, size, k, k);
  if (pk !== k) {
    swapRows(matM, k, pk);
    swapRows(p, k, pk);
  }
}
