import { celsiusToKelvin } from "../../util/unit";
import { k, q } from "../const";

export const npn = "npn" as const;
export const pnp = "pnp" as const;

export type BjtPolarity = typeof npn | typeof pnp;

export const nfet = "nfet" as const;
export const pfet = "pfet" as const;

export type FetPolarity = typeof nfet | typeof pfet;

export function bjtSign(polarity: BjtPolarity): number {
  switch (polarity) {
    case npn:
      return 1;
    case pnp:
      return -1;
  }
}

export function fetSign(polarity: FetPolarity): number {
  switch (polarity) {
    case nfet:
      return 1;
    case pfet:
      return -1;
  }
}

export class PN {
  /** The reverse bias saturation current. */
  readonly Is: number;
  /** The emission coefficient. */
  readonly N: number;
  /** The device temperature. */
  readonly Temp: number;
  /** The thermal voltage. */
  readonly Vt: number;
  /** The inverse of thermal voltage. */
  readonly invVt: number;
  /** The critical voltage. */
  readonly Vcrit: number;

  constructor(Is: number, N: number, Temp: number) {
    this.Is = Is;
    this.N = N;
    this.Temp = Temp;
    this.Vt = this.N * celsiusToKelvin(this.Temp) * (k / q);
    this.invVt = 1 / this.Vt;
    this.Vcrit = this.Vt * Math.log(this.Vt / Math.sqrt(2) / this.Is);
  }

  evalCurrent(V: number): number {
    if (V >= 0) {
      const { Is, invVt } = this;
      return Is * (Math.exp(invVt * V) - 1);
    } else {
      return 0;
    }
  }

  evalConductance(V: number): number {
    if (V >= 0) {
      const { Is, invVt } = this;
      return invVt * Is * Math.exp(invVt * V);
    } else {
      return 0;
    }
  }

  limitVoltage(Vnew: number, Vold: number): number {
    if (Vnew >= 0) {
      const { Vt, Vcrit } = this;
      if (Vnew > Vcrit && Math.abs(Vnew - Vold) > 2 * Vt) {
        if (Vold > 0) {
          const x = (Vnew - Vold) / Vt;
          if (x > 0) {
            Vnew = Vold + Vt * (2 + Math.log(x - 2));
          } else {
            Vnew = Vold - Vt * (2 + Math.log(2 - x));
          }
        } else {
          Vnew = Vcrit;
        }
      }
    }
    return Vnew;
  }
}

/**
 * Limits voltage changes on MOSFET terminals to help convergence.
 */
export function limitMosfetVoltage(Vnew: number, Vold: number): number {
  const d = 0.5;
  if (Math.abs(Vnew - Vold) > d) {
    if (Vnew > Vold) {
      return Vold + d;
    } else {
      return Vold - d;
    }
  }
  return Vnew;
}
