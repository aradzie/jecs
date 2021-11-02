import { Device, DeviceState, StateParams } from "../../circuit/device";
import type { Node, Stamper } from "../../circuit/network";
import type { Op } from "../../circuit/ops";
import { Params } from "../../circuit/params";

export interface OpAmpParams {
  readonly gain: number;
}

/**
 * Ideal operational amplifier.
 */
export class OpAmp extends Device<OpAmpParams> {
  static override readonly id = "OpAmp";
  static override readonly numTerminals = 3;
  static override readonly paramsSchema = {
    gain: Params.number({ title: "gain" }),
  };
  static override readonly stateParams: StateParams = {
    length: 0,
    outputs: [],
  };

  readonly a: Node;
  readonly b: Node;
  readonly o: Node;

  constructor(id: string, [a, b, o]: readonly Node[], params: OpAmpParams) {
    super(id, [a, b, o], params);
    this.a = a;
    this.b = b;
    this.o = o;
  }

  override eval(state: DeviceState): void {}

  override stamp(stamper: Stamper, state: DeviceState): void {}

  override ops(state: DeviceState = this.state): readonly Op[] {
    return [];
  }
}
