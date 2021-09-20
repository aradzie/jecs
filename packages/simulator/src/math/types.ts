export type MatrixLike = ArrayLike<ArrayLike<number>>;
export type Matrix = Float64Array[];
export type VectorLike = ArrayLike<number>;
export type Vector = Float64Array;

/**
 * Creates a new solver to find a solution to equation `A * x = b`.
 * @param matA A matrix `A`.
 */
export interface SolverFactory {
  (matA: MatrixLike): Solver;
}

export interface Solver {
  /**
   * Solves `A * x = b`, returns a solution vector `x`.
   * The matrix `A` is specified when a solver is created.
   * @param vecB A vector `b`.
   * @return A solution vector `x`.
   */
  solve(vecB: VectorLike): Vector;
}

export interface OneShotSolver {
  /**
   * Solves `A * x = b`, returns a solution vector `x`.
   * @param matA A matrix `A`.
   * @param vecB A vector `b`.
   * @return A solution vector `x`.
   */
  solve(matA: MatrixLike, vecB: VectorLike): Vector;
}
