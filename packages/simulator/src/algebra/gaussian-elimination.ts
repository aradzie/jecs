import { findPivotRow, swapRows } from "./pivot";
import type { Matrix, MatrixLike, Vector, VectorLike } from "./types";

/**
 * Solves `A * x = b`, returns a solution vector `x`.
 * Uses Gaussian elimination to find the solution.
 * @param matA A matrix `A`.
 * @param vecB A vector `b`.
 * @return A solution vector `x`.
 */
export function solve(matA: MatrixLike, vecB: VectorLike): Vector {
  const size = matA.length;

  if (size === 0) {
    throw new TypeError();
  }
  if (size !== vecB.length) {
    throw new TypeError();
  }

  const matM = new Array<Float64Array>(size);
  for (let i = 0; i < size; i++) {
    matM[i] = new Float64Array(matA[i]);
  }
  const vecM = new Float64Array(vecB);

  for (let k = 0; k < size - 1; k++) {
    pivot(matM, vecM, size, k);

    for (let i = k + 1; i < size; i++) {
      const mul = matM[i][k] / matM[k][k];
      for (let j = k; j < size; j++) {
        matM[i][j] -= matM[k][j] * mul;
      }
      vecM[i] -= vecM[k] * mul;
    }
  }

  const vecX = new Float64Array(size);

  for (let k = size - 1; k >= 0; k--) {
    const x = vecM[k] / matM[k][k];
    for (let i = k - 1; i >= 0; i--) {
      vecM[i] -= matM[i][k] * x;
    }
    vecX[k] = x;
  }

  return vecX;
}

function pivot(matM: Matrix, vecM: Vector, size: number, k: number): void {
  const [_, pk] = findPivotRow(matM, size, k, k);
  if (pk !== k) {
    swapRows(matM, k, pk);
    swapRows(vecM, k, pk);
  }
}
