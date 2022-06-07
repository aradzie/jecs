import { Device, DeviceState, EvalOptions } from "../circuit/device.js";
import type { Node, Stamper } from "../circuit/network.js";
import { Properties } from "../circuit/properties.js";

const enum S {
  C,
  V,
  I,
  P,
  Geq,
  Ieq,
  _Size_,
}

/**
 * Capacitor.
 */
export class Capacitor extends Device {
  static override readonly id = "C";
  static override readonly numTerminals = 2;
  static override readonly propertiesSchema = {
    C: Properties.number({
      title: "capacitance",
    }),
  };
  static override readonly stateSchema = {
    length: S._Size_,
    ops: [
      { index: S.V, name: "V", unit: "V" },
      { index: S.I, name: "I", unit: "A" },
      { index: S.P, name: "P", unit: "W" },
    ],
  };

  /** First terminal. */
  readonly na: Node;
  /** Second terminal. */
  readonly nb: Node;

  constructor(id: string, [na, nb]: readonly Node[]) {
    super(id, [na, nb]);
    this.na = na;
    this.nb = nb;
  }

  override deriveState(state: DeviceState): void {
    state[S.C] = this.properties.getNumber("C");
  }

  override beginEval(state: DeviceState, options: EvalOptions): void {
    const { na, nb } = this;
    const { timeStep } = options;
    const C = state[S.C];
    const V = na.voltage - nb.voltage;
    if (timeStep !== timeStep) {
      // DC analysis.
      state[S.Geq] = 0;
      state[S.Ieq] = 0;
    } else {
      // Transient analysis.
      const Geq = C / timeStep;
      const Ieq = -V * Geq;
      state[S.Geq] = Geq;
      state[S.Ieq] = Ieq;
    }
  }

  override stamp(state: DeviceState, stamper: Stamper): void {
    const { na, nb } = this;
    const Geq = state[S.Geq];
    const Ieq = state[S.Ieq];
    stamper.stampConductance(na, nb, Geq);
    stamper.stampCurrentSource(na, nb, Ieq);
  }

  override endEval(state: DeviceState, options: EvalOptions) {
    const { na, nb } = this;
    const { timeStep } = options;
    const V = na.voltage - nb.voltage;
    if (timeStep !== timeStep) {
      // DC analysis.
      state[S.V] = V;
      state[S.I] = 0;
      state[S.P] = 0;
    } else {
      // Transient analysis.
      const Geq = state[S.Geq];
      const Ieq = state[S.Ieq];
      const I = V * Geq + Ieq;
      const P = V * I;
      state[S.V] = V;
      state[S.I] = I;
      state[S.P] = P;
    }
  }
}
