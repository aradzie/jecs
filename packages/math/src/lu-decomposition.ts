import { SingularMatrixError } from "./error.js";
import { swapRows, vecMake } from "./matrix.js";
import { findPivotRow } from "./pivot.js";
import type { Matrix, PermVector, Solver, Vector } from "./types.js";

/**
 * Creates a new solver which uses LU decomposition to find a solution
 * to equation `A * x = b`.
 * @param mat A matrix `A`.
 */
export function createSolver(mat: Matrix): Solver {
  const size = mat.length;

  const perm = new Int32Array(size);
  for (let i = 0; i < size; i++) {
    perm[i] = i;
  }

  for (let k = 0; k < size; k++) {
    findPivot(mat, perm, size, k);
    const p = mat[k][k];
    if (p === 0) {
      throw new SingularMatrixError();
    }
    for (let j = k + 1; j < size; j++) {
      mat[k][j] /= p;
    }
    for (let i = k + 1; i < size; i++) {
      for (let j = k + 1; j < size; j++) {
        mat[i][j] -= mat[i][k] * mat[k][j];
      }
    }
  }

  const y = vecMake(size);

  return function solver(vec: Vector): void {
    // LUx = b, Ly = b, Ux = y

    // Use forward substitution to compute y.
    for (let k = 0; k < size; k++) {
      let sum = 0;
      for (let j = 0; j < k; j++) {
        sum += mat[k][j] * y[j];
      }
      y[k] = (vec[perm[k]] - sum) / mat[k][k];
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

function findPivot(matM: Matrix, permV: PermVector, size: number, k: number): void {
  const [_, pk] = findPivotRow(matM, size, k, k);
  if (pk !== k) {
    swapRows(matM, k, pk);
    swapRows(permV, k, pk);
  }
}
