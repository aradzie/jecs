import { MathError } from "./error";
import { swapRows } from "./matrix";
import { findPivotRow } from "./pivot";
import type { Matrix, MatrixLike, Solver, Vector } from "./types";

/**
 * Creates a new solver which uses LU decomposition to find a solution
 * to equation `A * x = b`.
 * @param matA A matrix `A`.
 */
export function createSolver(matA: MatrixLike): Solver {
  const size = matA.length;

  if (size === 0) {
    throw new MathError();
  }

  const matM = new Array<Float64Array>(size);
  const p = new Int32Array(size);
  for (let i = 0; i < size; i++) {
    matM[i] = new Float64Array(matA[i]);
    p[i] = i;
  }

  for (let k = 0; k < size; k++) {
    pivot(matM, p, size, k);

    for (let j = k + 1; j < size; j++) {
      matM[k][j] /= matM[k][k];
    }

    for (let i = k + 1; i < size; i++) {
      for (let j = k + 1; j < size; j++) {
        matM[i][j] -= matM[i][k] * matM[k][j];
      }
    }
  }

  const vecY = new Float64Array(size);

  return new (class implements Solver {
    solve(vecB: Vector): Vector {
      if (size !== vecB.length) {
        throw new MathError();
      }

      const vecX = new Float64Array(size);

      // LUx = b, Ux = y, Ly = b

      // Use forward substitution to compute y.
      for (let k = 0; k < size; k++) {
        let sum = 0;
        for (let j = 0; j < k; j++) {
          sum += matM[k][j] * vecY[j];
        }
        vecY[k] = (vecB[p[k]] - sum) / matM[k][k];
      }

      // Use backward substitution to compute x.
      for (let k = size - 1; k >= 0; k--) {
        let sum = 0;
        for (let j = k + 1; j < size; j++) {
          sum += matM[k][j] * vecX[j];
        }
        vecX[k] = vecY[k] - sum;
      }

      return vecX;
    }
  })();
}

function pivot(matM: Matrix, p: Int32Array, size: number, k: number): void {
  const [_, pk] = findPivotRow(matM, size, k, k);
  if (pk !== k) {
    swapRows(matM, k, pk);
    swapRows(p, k, pk);
  }
}
