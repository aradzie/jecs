import { CircuitError } from "../simulation/error";
import type { Node, Stamper } from "../simulation/network";

/** The electrical charge on the electron, `C`. */
export const q = 1.602176634e-19;

/** The Boltzmann constant, `J⋅K^(−1)`. */
export const k = 1.380649e-23;

/** The default reverse bias saturation current, `A`. */
export const default_I_S = 1e-14;

/** The default temperature, `K`. */
export const default_T = 3.0015e2;

/** The default ideality factor. */
export const default_n = 1;

export class PN {
  /** The reverse bias saturation current. */
  readonly I_S: number;
  /** The temperature. */
  readonly T: number;
  /** The ideality factor. */
  readonly n: number;
  /** The thermal voltage. */
  readonly V_T: number;
  /** Constant. */
  readonly c: number;

  constructor(I_S: number, T: number, n: number) {
    this.I_S = I_S;
    this.T = T;
    this.n = n;
    this.V_T = (k * T) / q;
    this.c = 1 / (this.V_T * this.n);
  }

  /** Computes diode current. */
  I_D(V_D: number): number {
    if (V_D < 0) {
      throw new CircuitError();
    }
    const { I_S, c } = this;
    return I_S * (Math.exp(c * V_D) - 1);
  }

  /** Computes diode conductance. */
  G_D(V_D: number): number {
    if (V_D < 0) {
      throw new CircuitError();
    }
    const { I_S, c } = this;
    return c * I_S * Math.exp(c * V_D);
  }

  /** Stamp matrix. */
  stamp(stamper: Stamper, na: Node, nb: Node, V_D: number): void {
    if (V_D < 0) {
      throw new CircuitError();
    }
    const { I_S, c } = this;
    const v = Math.min(V_D, 5);
    const exp = Math.exp(c * v);
    const I_D = I_S * (exp - 1);
    const G_D = c * I_S * exp;
    stamper.stampConductance(na, nb, G_D);
    stamper.stampCurrentSource(na, nb, I_D - G_D * v);
  }
}
