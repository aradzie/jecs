export interface Options {
  /** Absolute current error tolerance, `A`. */
  readonly abstol: number;
  /** Absolute voltage error tolerance, `V`. */
  readonly vntol: number;
  /** Relative error tolerance. */
  readonly reltol: number;
  /** Minimum conductance, `S`. */
  readonly gmin: number;
}

export const defaultOptions = Object.freeze<Options>({
  abstol: 1e-12,
  vntol: 1e-6,
  reltol: 1e-3,
  gmin: 1e-12,
});
