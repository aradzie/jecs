import { Device, DeviceState, StateParams } from "../circuit/device";
import type { Node, Stamper } from "../circuit/network";
import { Params, ParamsSchema } from "../circuit/params";

export interface ResistorParams {
  readonly R: number;
}

const enum S {
  R,
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

  constructor(id: string, [na, nb]: readonly Node[], params: ResistorParams) {
    super(id, [na, nb], params);
    this.na = na;
    this.nb = nb;
  }

  override eval(state: DeviceState, final: boolean): void {
    const { na, nb, params } = this;
    const { R } = params;
    const G = 1 / R;
    const V = na.voltage - nb.voltage;
    const I = V / R;
    const P = V * I;
    state[S.R] = R;
    state[S.G] = G;
    state[S.V] = V;
    state[S.I] = I;
    state[S.P] = P;
  }

  override stamp(stamper: Stamper, [R, G, Vd, I, P]: DeviceState): void {
    const { na, nb } = this;
    stamper.stampConductance(na, nb, G);
  }
}
