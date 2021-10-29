import { Device } from "../../circuit/device";
import type { Node, Stamper } from "../../circuit/network";
import type { Op } from "../../circuit/ops";
import { Params } from "../../circuit/params";

export interface OpAmpParams {
  readonly gain: number;
}

interface OpAmpState {}

/**
 * Ideal operational amplifier.
 */
export class OpAmp extends Device<OpAmpParams, OpAmpState> {
  static override readonly id = "OpAmp";
  static override readonly numTerminals = 3;
  static override readonly paramsSchema = {
    gain: Params.number({ title: "gain" }),
  };

  readonly a: Node;
  readonly b: Node;
  readonly o: Node;

  constructor(name: string, [a, b, o]: readonly Node[], params: OpAmpParams) {
    super(name, [a, b, o], params);
    this.a = a;
    this.b = b;
    this.o = o;
  }

  override getInitialState(): OpAmpState {
    return {};
  }

  override eval(state: OpAmpState): void {}

  override stamp(stamper: Stamper, state: OpAmpState): void {}

  override ops(state: OpAmpState = this.state): readonly Op[] {
    return [];
  }
}
