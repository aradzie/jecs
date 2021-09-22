import { MathError } from "./error";
import { swapRows } from "./matrix";
import { findPivotRow } from "./pivot";
import type { Matrix, MatrixLike, Vector, VectorLike } from "./types";

/**
 * Solves `A * x = b`, returns a solution vector `x`.
 * Uses Gauss-Jordan elimination to find the solution.
 * @param matA A matrix `A`.
 * @param vecB A vector `b`.
 * @return A solution vector `x`.
 */
export function solve(matA: MatrixLike, vecB: VectorLike): Vector {
  const size = matA.length;

  if (size === 0) {
    throw new MathError();
  }
  if (size !== vecB.length) {
    throw new MathError();
  }

  const matM = new Array<Float64Array>(size);
  for (let i = 0; i < size; i++) {
    matM[i] = new Float64Array(matA[i]);
  }
  const vecX = new Float64Array(vecB);

  for (let k = 0; k < size; k++) {
    pivot(matM, vecX, size, k);

    const f = matM[k][k];
    for (let j = k; j < size; j++) {
      matM[k][j] /= f;
    }
    vecX[k] /= f;

    for (let i = 0; i < size; i++) {
      if (i !== k) {
        const f = matM[i][k];
        for (let j = k; j < size; j++) {
          matM[i][j] -= f * matM[k][j];
        }
        vecX[i] -= f * vecX[k];
      }
    }
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
