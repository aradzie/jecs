import { Device, StateParams } from "../../circuit/device";
import type { Node, Stamper } from "../../circuit/network";
import type { Op } from "../../circuit/ops";
import { Params, ParamsSchema } from "../../circuit/params";
import { Unit } from "../../util/unit";

export interface CSourceParams {
  readonly I: number;
}

/**
 * Current source.
 */
export class CSource extends Device<CSourceParams> {
  static override readonly id = "I";
  static override readonly numTerminals = 2;
  static override readonly paramsSchema: ParamsSchema<CSourceParams> = {
    I: Params.number({ title: "current" }),
  };
  static override readonly stateParams: StateParams = {
    length: 0,
    outputs: [],
  };

  /** Positive terminal. */
  readonly np: Node;
  /** Negative terminal. */
  readonly nn: Node;

  constructor(id: string, [np, nn]: readonly Node[], params: CSourceParams) {
    super(id, [np, nn], params);
    this.np = np;
    this.nn = nn;
  }

  override stamp(stamper: Stamper): void {
    const { params, np, nn } = this;
    const { I } = params;
    stamper.stampCurrentSource(np, nn, I);
  }

  override ops(): readonly Op[] {
    const { params, np, nn } = this;
    const { I } = params;
    const V = np.voltage - nn.voltage;
    const P = V * I;
    return [
      { name: "I", value: I, unit: Unit.AMPERE },
      { name: "V", value: V, unit: Unit.VOLT },
      { name: "P", value: P, unit: Unit.WATT },
    ];
  }
}
