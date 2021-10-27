import type { Node, Stamper } from "../../circuit/network";
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
  /** The temperature. */
  readonly Temp: number;
  /** The reverse bias saturation current. */
  readonly Is: number;
  /** The emission coefficient. */
  readonly N: number;
  /** The thermal voltage. */
  readonly Vt: number;
  /** The inverse of thermal voltage. */
  readonly invVt: number;
  /** The critical voltage. */
  readonly Vcrit: number;

  constructor(Temp: number, Is: number, N: number) {
    this.Temp = Temp;
    this.Is = Is;
    this.N = N;
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

  stamp(stamper: Stamper, na: Node, nc: Node, Vd: number): void {
    const eqGd = this.evalConductance(Vd);
    const eqId = this.evalCurrent(Vd) - eqGd * Vd;
    stamper.stampConductance(na, nc, eqGd);
    stamper.stampCurrentSource(na, nc, eqId);
  }
}

/**
 * Limits gate-source or gate-drain voltage changes to help convergence.
 * @param Vnew Tne current GS or GD voltage.
 * @param Vold Tne previous GS or GD voltage.
 * @param Vth
 */
export function fetVoltageGSGD(
  Vnew: number,
  Vold: number,
  Vth: number,
): number {
  const Vtsthi = Math.abs(2 * (Vold - Vth)) + 2.0;
  const Vtstlo = Vtsthi / 2;
  const Vdelta = Vnew - Vold;
  if (Vold >= Vth) {
    /* FET is on */
    if (Vold >= Vth + 3.5) {
      if (Vdelta <= 0) {
        /* going off */
        if (Vnew >= Vth + 3.5) {
          if (-Vdelta > Vtstlo) {
            Vnew = Vold - Vtstlo;
          }
        } else {
          Vnew = Math.max(Vnew, Vth + 2);
        }
      } else {
        /* staying on */
        if (Vdelta >= Vtsthi) {
          Vnew = Vold + Vtsthi;
        }
      }
    } else {
      /* middle region */
      if (Vdelta <= 0) {
        /* decreasing */
        Vnew = Math.max(Vnew, Vth - 0.5);
      } else {
        /* increasing */
        Vnew = Math.min(Vnew, Vth + 4);
      }
    }
  } else {
    /* FET is off */
    if (Vdelta <= 0) {
      /* staying off */
      if (-Vdelta > Vtsthi) {
        Vnew = Vold - Vtsthi;
      }
    } else {
      /* going on */
      if (Vnew <= Vth + 0.5) {
        if (Vdelta > Vtstlo) {
          Vnew = Vold + Vtstlo;
        }
      } else {
        Vnew = Vth + 0.5;
      }
    }
  }
  return Vnew;
}

/**
 * Limits drain-source voltage changes to help convergence.
 * @param Vnew
 * @param Vold
 */
export function fetVoltageDS(Vnew: number, Vold: number): number {
  if (Vold >= 3.5) {
    if (Vnew > Vold) {
      Vnew = Math.min(Vnew, 3 * Vold + 2);
    } else if (Vnew < 3.5) {
      Vnew = Math.max(Vnew, 2.0);
    }
  } else {
    if (Vnew > Vold) {
      Vnew = Math.min(Vnew, 4.0);
    } else {
      Vnew = Math.max(Vnew, -0.5);
    }
  }
  return Vnew;
}
