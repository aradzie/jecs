import { Eg, k, q, Tnom, Xti } from "../const.js";

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

/**
 * Returns thermal voltage and saturation current.
 * @param temp Device temperature.
 * @param Is Saturation current.
 * @param N Emission coefficient.
 */
export function pnTemp(
  temp: number,
  Is: number,
  N: number,
): [Vt: number, Is: number, Vcrit: number] {
  const t = temp / Tnom;
  const Vt = N * temp * (k / q);
  const Ist = Is * Math.pow(t, Xti / N) * Math.exp((t - 1) * (Eg / Vt));
  const Vcrit = Vt * Math.log(Vt / Math.sqrt(2) / Ist);
  return [Vt, Ist, Vcrit];
}

/**
 * Returns PN junction current.
 * @param V Junction voltage.
 * @param Is Saturation current.
 * @param Vt Thermal voltage.
 */
export function pnCurrent(V: number, Is: number, Vt: number): number {
  if (V >= 0) {
    const invVt = 1 / Vt;
    return Is * (Math.exp(invVt * V) - 1);
  } else {
    return 0;
  }
}

/**
 * Returns PN junction conductance.
 * @param V Junction voltage.
 * @param Is Saturation current.
 * @param Vt Thermal voltage.
 */
export function pnConductance(V: number, Is: number, Vt: number): number {
  if (V >= 0) {
    const invVt = 1 / Vt;
    return invVt * Is * Math.exp(invVt * V);
  } else {
    return 0;
  }
}

/**
 * Limits voltage changes on PN junction to help convergence.
 * @param Vnew New voltage.
 * @param Vold Old voltage.
 * @param Vt Thermal voltage.
 * @param Vcrit Critical voltage.
 */
export function pnVoltage(Vnew: number, Vold: number, Vt: number, Vcrit: number): number {
  if (Vnew >= 0) {
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

/**
 * Limits voltage changes on MOSFET terminals to help convergence.
 * @param Vnew New voltage.
 * @param Vold Old voltage.
 */
export function mosfetVoltage(Vnew: number, Vold: number): number {
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
