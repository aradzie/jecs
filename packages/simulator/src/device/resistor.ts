import { Device, DeviceState, EvalOptions, StateParams } from "../circuit/device.js";
import { CircuitError } from "../circuit/error.js";
import type { Node, Stamper } from "../circuit/network.js";
import { Params, ParamsSchema } from "../circuit/params.js";

export interface ResistorParams {
  readonly R: number;
}

const enum S {
  G,
  V,
  I,
  P,
  _Size_,
}

/**
 * Resistor.
 */
export class Resistor extends Device<ResistorParams> {
  static override readonly id = "R";
  static override readonly numTerminals = 2;
  static override readonly paramsSchema: ParamsSchema<ResistorParams> = {
    R: Params.number({
      title: "resistance",
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

  constructor(
    id: string, //
    [na, nb]: readonly Node[],
    params: ResistorParams | null = null,
  ) {
    super(id, [na, nb], params);
    this.na = na;
    this.nb = nb;
  }

  override deriveState(
    state: DeviceState, //
    { R }: ResistorParams,
  ): void {
    if (R === 0) {
      throw new CircuitError(`Zero valued resistor`);
    }
    state[S.G] = 1 / R;
  }

  override eval(state: DeviceState, options: EvalOptions): void {
    const { na, nb } = this;
    const G = state[S.G];
    const V = na.voltage - nb.voltage;
    const I = V * G;
    const P = V * I;
    state[S.V] = V;
    state[S.I] = I;
    state[S.P] = P;
  }

  override stamp(state: DeviceState, stamper: Stamper): void {
    const { na, nb } = this;
    const G = state[S.G];
    stamper.stampConductance(na, nb, G);
  }
}
