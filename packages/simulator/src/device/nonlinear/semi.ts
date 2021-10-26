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

  limitVoltage(voltage: number, prevVoltage: number): number {
    if (voltage >= 0) {
      const { Vt, Vcrit } = this;
      if (voltage > Vcrit && Math.abs(voltage - prevVoltage) > 2 * Vt) {
        if (prevVoltage > 0) {
          const x = (voltage - prevVoltage) / Vt;
          if (x > 0) {
            voltage = prevVoltage + Vt * (2 + Math.log(x - 2));
          } else {
            voltage = prevVoltage - Vt * (2 + Math.log(2 - x));
          }
        } else {
          voltage = Vcrit;
        }
      }
    }
    return voltage;
  }

  stamp(stamper: Stamper, na: Node, nc: Node, Vd: number): void {
    const eqGd = this.evalConductance(Vd);
    const eqId = this.evalCurrent(Vd) - eqGd * Vd;
    stamper.stampConductance(na, nc, eqGd);
    stamper.stampCurrentSource(na, nc, eqId);
  }
}
