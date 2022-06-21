export type MatrixLike = ArrayLike<ArrayLike<number>>;
export type Matrix = Float64Array[];
export type VectorLike = ArrayLike<number>;
export type Vector = Float64Array;
export type PermVectorLike = ArrayLike<number>;
export type PermVector = Int32Array;

/**
 * Creates a new solver to find a solution to equation `A * x = b`.
 * @param mat A matrix `A`.
 */
export interface SolverFactory {
  (mat: Matrix): Solver;
}

export interface Solver {
  /**
   * Solves `A * x = b`, updates `b` with the values of the solution vector `x`.
   *
   * The matrix `A` is specified when a solver is created.
   *
   * The solution will be computed in place, and the content of both matrix `A`
   * and vector `b` will be overwritten, so make sure to make copies if you need
   * the original content.
   *
   * @param vec A vector which is `b` before the call
   * and is updated to contain the values of `x` after the call.
   */
  (vec: Vector): void;
}

export interface OneShotSolver {
  /**
   * Solves `A * x = b`.
   *
   * The solution will be computed in place, and the content of both matrix `A`
   * and vector `b` will be overwritten, so make sure to make copies if you need
   * the original content.
   *
   * @param mat A matrix `A`.
   * @param vec A vector which is `b` before the call and is updated to contain
   * the values of `x` after the call.
   */
  (mat: Matrix, vec: Vector): void;
}
