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
 * Returns PN junction current.
 * @param V Junction voltage.
 * @param Is Saturation current.
 * @param Vt Thermal voltage.
 */
export function pnCurrent(V: number, Is: number, Vt: number): number {
  if (V >= 0) {
    return Is * (Math.exp((1 / Vt) * V) - 1);
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
    return (1 / Vt) * Is * Math.exp((1 / Vt) * V);
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

export function coalesce(a: number, b: number): number {
  if (Number.isFinite(a)) {
    return a;
  }
  if (Number.isFinite(b)) {
    return b;
  }
  return 0;
}
