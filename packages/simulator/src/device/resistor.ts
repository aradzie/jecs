import { Device } from "../circuit/device";
import type { Node, Stamper } from "../circuit/network";
import type { Op } from "../circuit/ops";
import { Params, ParamsItem } from "../circuit/params";
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
  static override readonly paramsSchema: Record<
    keyof ResistorParams, //
    ParamsItem
  > = {
    R: Params.number({
      title: "resistance",
    }),
  };

  /** First terminal. */
  readonly na: Node;
  /** Second terminal. */
  readonly nb: Node;

  constructor(name: string, [na, nb]: readonly Node[], params: ResistorParams) {
    super(name, [na, nb], params);
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
    const voltage = na.voltage - nb.voltage;
    const current = voltage / R;
    const power = voltage * current;
    return [
      { name: "Vd", value: voltage, unit: Unit.VOLT },
      { name: "I", value: current, unit: Unit.AMPERE },
      { name: "P", value: power, unit: Unit.WATT },
    ];
  }
}
