import type { Properties } from "../circuit/properties.js";

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

export function getOptions(properties: Properties): Options {
  return {
    abstol: properties.getNumber("abstol"),
    vntol: properties.getNumber("vntol"),
    reltol: properties.getNumber("reltol"),
    gmin: properties.getNumber("gmin"),
  };
}
