import { Device, DeviceState, EvalOptions, StateParams } from "../circuit/device.js";
import { CircuitError } from "../circuit/error.js";
import type { Node, Stamper } from "../circuit/network.js";
import { Params, ParamsSchema } from "../circuit/params.js";

export interface CapacitorParams {
  readonly C: number;
}

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
export class Capacitor extends Device<CapacitorParams> {
  static override readonly id = "C";
  static override readonly numTerminals = 2;
  static override readonly paramsSchema: ParamsSchema<CapacitorParams> = {
    C: Params.number({
      title: "capacitance",
    }),
  };
  static override readonly stateParams: StateParams = {
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

  constructor(id: string, [na, nb]: readonly Node[], params: CapacitorParams | null = null) {
    super(id, [na, nb], params);
    this.na = na;
    this.nb = nb;
  }

  override deriveState(state: DeviceState, { C }: CapacitorParams): void {
    if (C === 0) {
      throw new CircuitError(`Zero valued capacitor`);
    }
    state[S.C] = C;
  }

  override beginEval(state: DeviceState, options: EvalOptions): void {
    const { na, nb } = this;
    const { timeStep, gmin } = options;
    const C = state[S.C];
    const V = na.voltage - nb.voltage;
    if (timeStep !== timeStep) {
      // DC analysis.
      state[S.Geq] = gmin;
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
