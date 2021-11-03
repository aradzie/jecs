import { Device, StateParams } from "../circuit/device";
import type { Node, Stamper } from "../circuit/network";
import type { Op } from "../circuit/ops";
import { Params, ParamsSchema } from "../circuit/params";
import { Unit } from "../util/unit";

export interface ResistorParams {
  readonly R: number;
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
    length: 0,
    outputs: [],
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

  override stamp(stamper: Stamper): void {
    const { params, na, nb } = this;
    const { R } = params;
    stamper.stampConductance(na, nb, 1.0 / R);
  }

  override ops(): readonly Op[] {
    const { params, na, nb } = this;
    const { R } = params;
    const V = na.voltage - nb.voltage;
    const I = V / R;
    const P = V * I;
    return [
      { name: "V", value: V, unit: Unit.VOLT },
      { name: "I", value: I, unit: Unit.AMPERE },
      { name: "P", value: P, unit: Unit.WATT },
    ];
  }
}
