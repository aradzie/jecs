import { matClear, matMake, permClear, permMake, vecClear, vecMake } from "./matrix.js";
import { findPartialPivot, swap } from "./pivot.js";
import { solveGauss } from "./solve-gauss.js";
import { solveGaussJordan } from "./solve-gauss-jordan.js";
import { factorLu, solveLu } from "./solve-lu.js";
import { type Matrix, type PermVector, type Vector } from "./types.js";

export enum SleMethod {
  Gauss = "gauss",
  GaussJordan = "gauss-jordan",
  LU = "lu",
}

/**
 * A system of linear equations.
 */
export class Sle {
  /** The number of variables in this SLE. */
  readonly size: number;
  /** The left-hand side matrix. */
  readonly A: Matrix;
  /** The solution vector. */
  readonly x: Vector;
  /** The right-hand side vector. */
  readonly b: Vector;
  /** The permutation vector. */
  readonly perm: PermVector;

  constructor(size: number) {
    this.size = size;
    this.A = matMake(size);
    this.x = vecMake(size);
    this.b = vecMake(size);
    this.perm = permMake(size);
  }

  /**
   * Clears all the matrices and vectors.
   */
  clear(): void {
    matClear(this.A);
    vecClear(this.x);
    vecClear(this.b);
    permClear(this.perm);
  }

  /**
   * Solves `A * x = b` using the specified method.
   */
  solve(method: SleMethod): void {
    switch (method) {
      case SleMethod.Gauss:
        solveGauss(this);
        break;
      case SleMethod.GaussJordan:
        solveGaussJordan(this);
        break;
      case SleMethod.LU:
        factorLu(this);
        solveLu(this);
        break;
    }
  }

  findPivot(k: number): void {
    const { size, A, b } = this;
    const pivotRow = findPartialPivot(A, size, k);
    if (pivotRow !== k) {
      swap(A, k, pivotRow);
      swap(b, k, pivotRow);
    }
  }
}
